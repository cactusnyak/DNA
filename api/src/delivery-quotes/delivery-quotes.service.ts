import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OversizedDeliveryQuoteStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { resolveEffectiveOversizedStatus } from '../products/oversized-status';
import { DeliveryQuoteEmailService } from './delivery-quote-email.service';

type Owner = { userId?: string; guestSessionId?: string };

@Injectable()
export class DeliveryQuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deliveryQuoteEmail: DeliveryQuoteEmailService,
  ) {}

  async create(body: Record<string, unknown>, owner: Owner) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: this.required(body.productId, 'productId'),
        isActive: true,
        deletedAt: null,
      },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Товар не найден.');
    if (
      !resolveEffectiveOversizedStatus(
        product.isOversizedOverride,
        product.category.isOversized,
      )
    ) {
      throw new BadRequestException('Для обычного товара расчёт не требуется.');
    }
    if (!product.location)
      throw new BadRequestException('У товара не указано место отправления.');
    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1)
      throw new BadRequestException('Укажите корректное количество.');
    const guestSessionId = owner.userId
      ? undefined
      : this.required(owner.guestSessionId, 'guestSessionId');
    const quote = await this.prisma.oversizedDeliveryQuote.create({
      data: {
        productId: product.id,
        userId: owner.userId,
        guestSessionId,
        quantity,
        dispatchLocation: product.location,
        destinationRegion: this.required(
          body.destinationRegion,
          'destinationRegion',
        ),
        destinationCity: this.required(body.destinationCity, 'destinationCity'),
        destinationAddress: this.required(
          body.destinationAddress,
          'destinationAddress',
        ),
        customerName: this.required(body.customerName, 'customerName'),
        customerPhone: this.required(body.customerPhone, 'customerPhone'),
        customerEmail: this.optional(body.customerEmail),
        customerComment: this.optional(body.customerComment),
        unloadingRequired: body.unloadingRequired === true,
        accessRestrictions: this.optional(body.accessRestrictions),
      },
      include: { product: true },
    });

    await this.deliveryQuoteEmail.notifyManager(quote);

    return quote;
  }

  async findOwned(id: string, owner: Owner) {
    const quote = await this.prisma.oversizedDeliveryQuote.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!quote) throw new NotFoundException('Расчёт не найден.');
    this.assertOwner(quote, owner);
    if (
      quote.status !== OversizedDeliveryQuoteStatus.EXPIRED &&
      quote.expiresAt &&
      quote.expiresAt <= new Date()
    ) {
      return this.prisma.oversizedDeliveryQuote.update({
        where: { id },
        data: { status: OversizedDeliveryQuoteStatus.EXPIRED },
        include: { product: true },
      });
    }
    return quote;
  }

  async accept(id: string, owner: Owner) {
    const quote = await this.findOwned(id, owner);
    if (
      quote.status !== OversizedDeliveryQuoteStatus.QUOTED ||
      quote.confirmedDeliveryPrice == null
    ) {
      throw new BadRequestException('Расчёт ещё не подтверждён менеджером.');
    }
    if (quote.expiresAt && quote.expiresAt <= new Date())
      throw new BadRequestException('Срок действия расчёта истёк.');
    return this.prisma.oversizedDeliveryQuote.update({
      where: { id },
      data: {
        status: OversizedDeliveryQuoteStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    });
  }

  listAdmin(status?: OversizedDeliveryQuoteStatus) {
    return this.prisma.oversizedDeliveryQuote.findMany({
      where: status ? { status } : undefined,
      include: { product: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateAdmin(id: string, body: Record<string, unknown>) {
    const current = await this.prisma.oversizedDeliveryQuote.findUnique({
      where: { id },
    });
    if (!current) throw new NotFoundException('Расчёт не найден.');
    const status = body.status as OversizedDeliveryQuoteStatus;
    if (!Object.values(OversizedDeliveryQuoteStatus).includes(status))
      throw new BadRequestException('Некорректный статус.');
    const price =
      body.confirmedDeliveryPrice == null
        ? current.confirmedDeliveryPrice
        : Number(body.confirmedDeliveryPrice);
    if (
      status === OversizedDeliveryQuoteStatus.QUOTED &&
      (!Number.isInteger(price) || price! < 0)
    )
      throw new BadRequestException('Укажите цену доставки в рублях.');
    return this.prisma.oversizedDeliveryQuote.update({
      where: { id },
      data: {
        status,
        confirmedDeliveryPrice: price,
        managerComment: this.optional(body.managerComment),
        expiresAt:
          typeof body.expiresAt === 'string'
            ? new Date(body.expiresAt)
            : current.expiresAt,
      },
    });
  }

  private assertOwner(
    quote: { userId: string | null; guestSessionId: string | null },
    owner: Owner,
  ) {
    if (
      (quote.userId && quote.userId === owner.userId) ||
      (!quote.userId &&
        quote.guestSessionId &&
        quote.guestSessionId === owner.guestSessionId)
    )
      return;
    throw new ForbiddenException('Нет доступа к этому расчёту.');
  }
  private required(value: unknown, field: string) {
    if (typeof value !== 'string' || !value.trim())
      throw new BadRequestException(`${field} is required`);
    return value.trim();
  }
  private optional(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }
}
