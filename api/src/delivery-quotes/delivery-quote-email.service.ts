import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  EMAIL_DELIVERY_PROVIDER,
  type EmailDeliveryProvider,
} from '../email/email-delivery-provider.interface';
import { buildDeliveryQuoteRequestEmail } from './delivery-quote-email.template';

type DeliveryQuote = {
  id: string;
  productId: string;
  destinationRegion: string;
  destinationCity: string;
  destinationAddress: string;
  customerName: string;
  customerPhone: string;
  createdAt: Date;
  product: { title: string };
};

@Injectable()
export class DeliveryQuoteEmailService {
  constructor(
    private readonly config: ConfigService,
    @Inject(EMAIL_DELIVERY_PROVIDER)
    private readonly emailProvider: EmailDeliveryProvider,
  ) {}

  async notifyManager(quote: DeliveryQuote) {
    const managerEmail = this.config.get<string>('MANAGER_EMAIL');
    if (!managerEmail) {
      throw new ServiceUnavailableException('Manager email is not configured');
    }

    const email = buildDeliveryQuoteRequestEmail({
      requestId: quote.id,
      productId: quote.productId,
      productName: quote.product.title,
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      deliveryAddress: [
        quote.destinationRegion,
        quote.destinationCity,
        quote.destinationAddress,
      ].join(', '),
      requestedAt: quote.createdAt,
    });

    await this.emailProvider.sendEmail({
      to: managerEmail,
      ...email,
      idempotencyKey: `delivery-quote-${quote.id}`,
    });
  }
}
