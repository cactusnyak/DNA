import {
  Inject,
  Injectable,
  Logger,
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
  private readonly logger = new Logger(DeliveryQuoteEmailService.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(EMAIL_DELIVERY_PROVIDER)
    private readonly emailProvider: EmailDeliveryProvider,
  ) {}

  async notifyManager(quote: DeliveryQuote) {
    const managerEmail = this.config.get<string>('MANAGER_EMAIL');
    if (!managerEmail) {
      this.logger.error(
        JSON.stringify({
          event: 'delivery_quote.manager_notification.missing_recipient',
          deliveryRequestId: quote.id,
        }),
      );
      throw new ServiceUnavailableException('Manager email is not configured');
    }
    const selectedProvider = this.config.get<string>('EMAIL_DELIVERY_PROVIDER');
    if (selectedProvider !== 'resend') {
      this.logger.error(
        JSON.stringify({
          event: 'delivery_quote.manager_notification.invalid_provider',
          deliveryRequestId: quote.id,
          selectedProvider: selectedProvider ?? null,
        }),
      );
      throw new ServiceUnavailableException(
        'Manager email delivery is not configured',
      );
    }

    this.logger.log(
      JSON.stringify({
        event: 'delivery_quote.manager_notification.triggered',
        deliveryRequestId: quote.id,
        selectedProvider,
        recipient: maskEmail(managerEmail),
      }),
    );

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

    const result = await this.emailProvider.sendEmail({
      to: managerEmail,
      ...email,
      idempotencyKey: `delivery-quote-${quote.id}`,
      logContext: { deliveryRequestId: quote.id },
    });

    if (result.provider !== 'resend' || !result.externalMessageId) {
      throw new ServiceUnavailableException(
        'Email provider did not confirm delivery',
      );
    }
    return result;
  }
}

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  return domain ? `${local.slice(0, 2)}***@${domain}` : '***';
}
