import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import type {
  EmailDeliveryProvider,
  SendEmailCommand,
  SendEmailResult,
} from '../email-delivery-provider.interface';

@Injectable()
export class ResendEmailProvider implements EmailDeliveryProvider {
  private readonly logger = new Logger(ResendEmailProvider.name);
  private client?: Resend;

  constructor(private readonly config: ConfigService) {}

  private getClient(): Resend {
    if (!this.client) {
      this.client = new Resend(
        this.config.getOrThrow<string>('RESEND_API_KEY'),
      );
    }

    return this.client;
  }

  async sendEmail(command: SendEmailCommand): Promise<SendEmailResult> {
    const from = this.config.getOrThrow<string>('RESEND_FROM_EMAIL');
    const replyTo = this.config.get<string>('RESEND_REPLY_TO_EMAIL');

    const { data, error } = await this.getClient().emails.send(
      {
        from,
        to: command.to,
        subject: command.subject,
        html: command.html,
        text: command.text,
        ...(replyTo ? { replyTo } : {}),
      },
      command.idempotencyKey
        ? { idempotencyKey: command.idempotencyKey }
        : undefined,
    );

    if (error) {
      this.logger.error(
        JSON.stringify({
          event: 'email.resend.failed',
          name: error.name,
          message: error.message,
        }),
      );

      throw new ServiceUnavailableException(
        'Email delivery is temporarily unavailable',
      );
    }

    return { provider: 'resend', externalMessageId: data?.id };
  }
}
