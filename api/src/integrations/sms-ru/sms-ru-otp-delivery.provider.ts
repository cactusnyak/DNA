import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type {
  OtpDeliveryProvider,
  SendOtpCommand,
} from '../../auth/otp-delivery.provider';
import { SmsRuClient } from './sms-ru.client';

@Injectable()
export class SmsRuOtpDeliveryProvider implements OtpDeliveryProvider {
  constructor(
    private readonly client: SmsRuClient,
    private readonly config: ConfigService,
  ) {}

  async sendOtp(command: SendOtpCommand) {
    const template = this.config.getOrThrow<string>(
      'SMS_RU_OTP_MESSAGE_TEMPLATE',
    );
    const result = await this.client.send({
      phone: command.phone,
      message: template.replace('{code}', command.code),
      clientIp: command.clientIp,
      ttlMinutes: Math.ceil(command.expiresInSeconds / 60),
    });
    return {
      provider: 'sms_ru' as const,
      accepted: true,
      externalMessageId: result.messageId,
      providerStatusCode: result.statusCode,
      balanceAfterSend: result.balance,
    };
  }
}
