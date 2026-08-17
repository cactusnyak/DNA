import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';

import { AuthCapabilitiesModule } from './capabilities/auth-capabilities.module';
import { OtpController } from './otp.controller';
import { ConsoleOtpDeliveryProvider } from './console-otp-delivery.provider';
import { OTP_DELIVERY_PROVIDER } from './otp-delivery.provider';
import { OtpService } from './otp.service';
import { SmsRuClient } from '../integrations/sms-ru/sms-ru.client';
import { SmsRuOtpDeliveryProvider } from '../integrations/sms-ru/sms-ru-otp-delivery.provider';
import { TokenModule } from './token.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    TokenModule,
    AuthCapabilitiesModule,
    EmailModule,
  ],
  controllers: [OtpController],
  providers: [
    OtpService,
    ConsoleOtpDeliveryProvider,
    SmsRuClient,
    SmsRuOtpDeliveryProvider,
    {
      provide: OTP_DELIVERY_PROVIDER,
      inject: [
        ConfigService,
        ConsoleOtpDeliveryProvider,
        SmsRuOtpDeliveryProvider,
      ],
      useFactory: (
        config: ConfigService,
        consoleProvider: ConsoleOtpDeliveryProvider,
        smsRuProvider: SmsRuOtpDeliveryProvider,
      ) =>
        config.get<string>('OTP_DELIVERY_PROVIDER') === 'sms_ru'
          ? smsRuProvider
          : consoleProvider,
    },
  ],
})
export class OtpModule {}
