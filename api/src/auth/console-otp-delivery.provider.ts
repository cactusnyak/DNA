import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type {
  OtpDeliveryProvider,
  SendOtpCommand,
  SendOtpResult,
} from './otp-delivery.provider';

@Injectable()
export class ConsoleOtpDeliveryProvider implements OtpDeliveryProvider {
  private readonly logger = new Logger(ConsoleOtpDeliveryProvider.name);

  constructor(private readonly config: ConfigService) {}

  sendOtp(command: SendOtpCommand): Promise<SendOtpResult> {
    if (this.config.get<boolean>('OTP_LOG_CODES')) {
      this.logger.debug(
        `[LOCAL SMS OTP] ${command.phone.replace(/^(\d{1})\d+(\d{4})$/, '$1******$2')}: ${command.code}`,
      );
    }

    return Promise.resolve({ provider: 'console', accepted: true });
  }
}
