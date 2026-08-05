import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
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
    const logFields = {
      deliveryRequestId: command.logContext?.deliveryRequestId,
      provider: 'resend',
      recipient: maskEmail(command.to),
      sender: from,
    };

    this.logger.log(
      JSON.stringify({ event: 'email.resend.request_started', ...logFields }),
    );

    try {
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

      if (error || !data?.id) {
        this.logger.error(
          JSON.stringify({
            event: 'email.resend.failed',
            ...logFields,
            httpStatus:
              error && 'statusCode' in error ? error.statusCode : null,
            errorName: error?.name ?? 'MissingResponseData',
            errorMessage: error?.message ?? 'Resend returned no message ID',
          }),
        );
        throw new ServiceUnavailableException(
          'Email delivery is temporarily unavailable',
        );
      }

      this.logger.log(
        JSON.stringify({
          event: 'email.resend.succeeded',
          ...logFields,
          externalMessageId: data.id,
        }),
      );

      return { provider: 'resend', externalMessageId: data.id };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      const safeError = error as {
        name?: string;
        message?: string;
        statusCode?: number;
        status?: number;
      };
      this.logger.error(
        JSON.stringify({
          event: 'email.resend.failed',
          ...logFields,
          httpStatus: safeError.statusCode ?? safeError.status ?? null,
          errorName: safeError.name ?? 'Error',
          errorMessage: safeError.message ?? 'Unknown provider error',
        }),
      );
      throw new ServiceUnavailableException(
        'Email delivery is temporarily unavailable',
      );
    }
  }
}

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  return domain ? `${local.slice(0, 2)}***@${domain}` : '***';
}
