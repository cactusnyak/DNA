import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

import { OrderStatus } from '@prisma/client';

import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';

import { PaymentsService } from './payments.service';
import type { YookassaWebhookPayload } from './types/yookassa.types';

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
  ) {
    const user = await this.authService.getOptionalMeFromAuthorizationHeader(
      authorizationHeader,
    );

    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user && order.userId && order.userId !== user.id) {
      throw new BadRequestException('Access denied');
    }

    if (order.status !== OrderStatus.AWAITING_PAYMENT) {
      throw new BadRequestException(
        `Cannot initiate payment for order with status ${order.status}`,
      );
    }

    const webAppUrl = this.configService.getOrThrow<string>('WEB_APP_URL');
    const returnUrl = `${webAppUrl}/checkout/result?orderId=${orderId}`;

    const payment = await this.paymentsService.createPayment({
      orderId: order.id,
      amountKopecks: order.totalAmount,
      description: `Заказ №${order.id.slice(0, 8)}`,
      returnUrl,
    });

    await this.prismaService.order.update({
      where: { id: orderId },
      data: { yookassaPaymentId: payment.id },
    });

    const confirmation = payment.confirmation as { type: string; confirmation_token?: string };

    return {
      paymentId: payment.id,
      confirmationToken: confirmation.confirmation_token ?? null,
      status: payment.status,
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

    const yookassaPaymentId = payload.object.id;

    const order = await this.prismaService.order.findFirst({
      where: { yookassaPaymentId },
    });

    if (!order) {
      return { received: true };
    }

    if (payload.event === 'payment.succeeded') {
      await this.prismaService.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID },
      });
    } else if (payload.event === 'payment.canceled') {
      await this.prismaService.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED },
      });
    }

    return { received: true };
  }
}
