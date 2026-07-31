import { Injectable, Logger } from '@nestjs/common';

import type {
  EmailDeliveryProvider,
  SendEmailCommand,
  SendEmailResult,
} from '../email-delivery-provider.interface';

@Injectable()
export class ConsoleEmailProvider implements EmailDeliveryProvider {
  private readonly logger = new Logger(ConsoleEmailProvider.name);

  async sendEmail(command: SendEmailCommand): Promise<SendEmailResult> {
    this.logger.log(
      `[console-email] to=${command.to} subject="${command.subject}"\n${command.text}`,
    );

    return { provider: 'console' };
  }
}
