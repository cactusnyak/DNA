import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { OrderStatus, PaymentAttemptStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';

import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';

import { PaymentsService } from './payments.service';
import type {
  YookassaPayment,
  YookassaReceiptItem,
  YookassaWebhookPayload,
} from './types/yookassa.types';

const ORDER_FOR_PAYMENT_INCLUDE = {
  items: {
    include: {
      product: {
        select: { title: true },
      },
      deliveryQuote: true,
    },
  },
} satisfies Prisma.OrderInclude;

type OrderForPayment = Prisma.OrderGetPayload<{
  include: typeof ORDER_FOR_PAYMENT_INCLUDE;
}>;

@ApiTags('Payments')
@Controller()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('orders/:orderId/payment')
  async createPayment(
    @Param('orderId') orderId: string,
    @Headers('authorization') authorizationHeader?: string,
    @Headers('x-guest-session-id') guestSessionId?: string,
  ) {
    const order = await this.getAccessibleOrder(
      orderId,
      authorizationHeader,
      guestSessionId,
    );

    if (order.status !== OrderStatus.AWAITING_PAYMENT) {
      throw new BadRequestException(
        `Cannot initiate payment for order with status ${order.status}`,
      );
    }

    const invalidOversizedItem = order.items.find(
      (item) =>
        item.isOversized &&
        (!item.deliveryQuote ||
          item.deliveryQuote.status !== 'ACCEPTED' ||
          item.deliveryQuote.productId !== item.productId ||
          item.deliveryQuote.quantity !== item.quantity ||
          item.deliveryQuote.confirmedDeliveryPrice !== item.deliveryPrice ||
          (item.deliveryQuote.expiresAt &&
            item.deliveryQuote.expiresAt <= new Date())),
    );
    if (invalidOversizedItem) {
      throw new BadRequestException(
        'Для крупногабаритных товаров требуется действующий принятый расчёт доставки.',
      );
    }

    if (!order.customerEmail) {
      throw new BadRequestException(
        'Customer email is required to issue a receipt',
      );
    }

    let attempt = await this.prismaService.paymentAttempt.findUnique({
      where: { activeOrderId: order.id },
    });

    if (!attempt) {
      try {
        attempt = await this.prismaService.paymentAttempt.create({
          data: {
            orderId: order.id,
            activeOrderId: order.id,
            idempotenceKey: randomUUID(),
            amount: order.totalAmount,
          },
        });
      } catch (error) {
        if (
          !(error instanceof Prisma.PrismaClientKnownRequestError) ||
          error.code !== 'P2002'
        ) {
          throw error;
        }
        attempt = await this.prismaService.paymentAttempt.findUnique({
          where: { activeOrderId: order.id },
        });
      }
    }

    if (!attempt) {
      throw new BadRequestException('Could not create a payment attempt');
    }

    const payment = attempt.providerPaymentId
      ? await this.paymentsService.getPayment(attempt.providerPaymentId)
      : await this.paymentsService.createPayment({
          orderId: order.id,
          amountRubles: order.totalAmount,
          description: `Заказ №${order.id.slice(0, 8)}`,
          returnUrl: this.getReturnUrl(order.id),
          customerEmail: order.customerEmail,
          receiptItems: this.buildReceiptItems(order),
          idempotenceKey: attempt.idempotenceKey,
        });

    await this.saveProviderPayment(attempt.id, order, payment);

    return this.toPaymentResponse(payment);
  }

  @Get('orders/:orderId/payment')
  async getOrderPayment(
    @Param('orderId') orderId: string,
    @Headers('authorization') authorizationHeader?: string,
    @Headers('x-guest-session-id') guestSessionId?: string,
  ) {
    const order = await this.getAccessibleOrder(
      orderId,
      authorizationHeader,
      guestSessionId,
    );
    const attempt = await this.prismaService.paymentAttempt.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    if (!attempt?.providerPaymentId) {
      return {
        paymentId: null,
        paymentStatus: attempt?.status ?? null,
        orderStatus: order.status,
      };
    }

    const payment = await this.paymentsService.getPayment(
      attempt.providerPaymentId,
    );
    await this.saveProviderPayment(attempt.id, order, payment);

    const currentOrder = await this.prismaService.order.findUniqueOrThrow({
      where: { id: orderId },
      select: { status: true },
    });

    return {
      paymentId: payment.id,
      paymentStatus: payment.status,
      orderStatus: currentOrder.status,
    };
  }

  @Post('payments/webhook')
  async handleWebhook(@Body() body: unknown) {
    let payload: YookassaWebhookPayload;

    try {
      payload = this.paymentsService.parseWebhook(body);
    } catch {
      throw new BadRequestException('Invalid webhook payload');
    }

    const attempt = await this.prismaService.paymentAttempt.findUnique({
      where: { providerPaymentId: payload.object.id },
      include: { order: { include: ORDER_FOR_PAYMENT_INCLUDE } },
    });

    // Unknown IDs are acknowledged without making attacker-controlled API calls.
    if (!attempt) return { received: true };

    // YooKassa notifications have no signature. Always fetch the authoritative
    // object over the authenticated API before changing local state.
    const payment = await this.paymentsService.getPayment(payload.object.id);
    await this.saveProviderPayment(attempt.id, attempt.order, payment);

    return { received: true };
  }

  private async getAccessibleOrder(
    orderId: string,
    authorizationHeader?: string,
    guestSessionId?: string,
  ) {
    const user =
      await this.authService.getOptionalMeFromAuthorizationHeader(
        authorizationHeader,
      );
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: ORDER_FOR_PAYMENT_INCLUDE,
    });

    if (!order) throw new NotFoundException('Order not found');

    const ownsUserOrder = Boolean(user && order.userId === user.id);
    const ownsGuestOrder = Boolean(
      !order.userId &&
      order.guestSessionId &&
      guestSessionId &&
      order.guestSessionId === guestSessionId,
    );
    if (!ownsUserOrder && !ownsGuestOrder) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  private getReturnUrl(orderId: string) {
    const webAppUrl = this.configService
      .getOrThrow<string>('WEB_APP_URL')
      .replace(/\/$/, '');
    return `${webAppUrl}/checkout/result?orderId=${encodeURIComponent(orderId)}`;
  }

  private buildReceiptItems(order: OrderForPayment): YookassaReceiptItem[] {
    const vatCode = this.configService.get<number>('YOOKASSA_VAT_CODE', 1);
    const items: YookassaReceiptItem[] = [];

    for (const item of order.items) {
      const additions = Array.isArray(item.selectedAdditions)
        ? (
            item.selectedAdditions as Array<{
              title?: unknown;
              totalPrice?: unknown;
            }>
          )
            .filter((addition) => Number(addition.totalPrice) > 0)
            .map((addition) =>
              typeof addition.title === 'string' ? addition.title.trim() : '',
            )
            .filter(Boolean)
        : [];
      const description = [item.product.title, ...additions]
        .join(', ')
        .slice(0, 128);
      items.push({
        description,
        quantity: item.quantity.toFixed(3),
        amount: {
          value: item.unitPrice.toFixed(2),
          currency: 'RUB',
        },
        vat_code: vatCode,
        payment_mode: 'full_payment',
        payment_subject: 'commodity',
      });

      if (item.deliveryPrice > 0) {
        items.push({
          description: `Доставка: ${item.product.title}`.slice(0, 128),
          quantity: '1.000',
          amount: {
            value: item.deliveryPrice.toFixed(2),
            currency: 'RUB',
          },
          vat_code: vatCode,
          payment_mode: 'full_payment',
          payment_subject: 'service',
        });
      }
    }

    if (items.length > 80) {
      throw new BadRequestException(
        'Order has too many receipt positions (maximum is 80)',
      );
    }

    const receiptTotal = items.reduce(
      (sum, item) => sum + Number(item.amount.value) * Number(item.quantity),
      0,
    );
    if (Math.round(receiptTotal * 100) !== order.totalAmount * 100) {
      throw new InternalServerErrorException(
        'Receipt total does not match order total',
      );
    }

    return items;
  }

  private async saveProviderPayment(
    attemptId: string,
    order: OrderForPayment,
    payment: YookassaPayment,
  ) {
    this.assertPaymentMatchesOrder(payment, order);
    const status = this.mapPaymentStatus(payment.status);
    const succeeded = payment.status === 'succeeded' && payment.paid;
    const canceled = payment.status === 'canceled';

    await this.prismaService.$transaction([
      this.prismaService.paymentAttempt.update({
        where: { id: attemptId },
        data: {
          providerPaymentId: payment.id,
          status,
          test: payment.test,
          providerCreatedAt: new Date(payment.created_at),
          cancellationReason: payment.cancellation_details?.reason,
          activeOrderId: canceled ? null : order.id,
        },
      }),
      this.prismaService.order.update({
        where: { id: order.id },
        data: {
          yookassaPaymentId: payment.id,
          ...(succeeded && order.status === OrderStatus.AWAITING_PAYMENT
            ? { status: OrderStatus.PAID }
            : {}),
        },
      }),
    ]);
  }

  private assertPaymentMatchesOrder(
    payment: YookassaPayment,
    order: OrderForPayment,
  ) {
    const expectedTestMode = this.configService.get<boolean>(
      'YOOKASSA_EXPECTED_TEST_MODE',
    );
    if (
      typeof expectedTestMode === 'boolean' &&
      payment.test !== expectedTestMode
    ) {
      throw new BadRequestException(
        'Payment test mode does not match environment configuration',
      );
    }
    if (
      payment.amount.currency !== 'RUB' ||
      payment.amount.value !== order.totalAmount.toFixed(2) ||
      payment.metadata?.orderId !== order.id
    ) {
      throw new BadRequestException('Payment does not match order');
    }
  }

  private mapPaymentStatus(status: YookassaPayment['status']) {
    const statuses: Record<YookassaPayment['status'], PaymentAttemptStatus> = {
      pending: PaymentAttemptStatus.PENDING,
      waiting_for_capture: PaymentAttemptStatus.WAITING_FOR_CAPTURE,
      succeeded: PaymentAttemptStatus.SUCCEEDED,
      canceled: PaymentAttemptStatus.CANCELED,
    };
    return statuses[status];
  }

  private toPaymentResponse(payment: YookassaPayment) {
    const confirmation = payment.confirmation as {
      confirmation_token?: string;
    };
    return {
      paymentId: payment.id,
      confirmationToken: confirmation?.confirmation_token ?? null,
      status: payment.status,
    };
  }
}
