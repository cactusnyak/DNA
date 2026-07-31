import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthEmailSenderService } from './auth-email-sender.service';
import { EMAIL_DELIVERY_PROVIDER } from './email-delivery-provider.interface';
import { ConsoleEmailProvider } from './providers/console-email.provider';
import { ResendEmailProvider } from './providers/resend-email.provider';

@Module({
  providers: [
    ConsoleEmailProvider,
    ResendEmailProvider,
    AuthEmailSenderService,
    {
      provide: EMAIL_DELIVERY_PROVIDER,
      inject: [ConfigService, ConsoleEmailProvider, ResendEmailProvider],
      useFactory: (
        config: ConfigService,
        consoleProvider: ConsoleEmailProvider,
        resendProvider: ResendEmailProvider,
      ) =>
        config.get<string>('EMAIL_DELIVERY_PROVIDER') === 'resend'
          ? resendProvider
          : consoleProvider,
    },
  ],
  exports: [EMAIL_DELIVERY_PROVIDER, AuthEmailSenderService],
})
export class EmailModule {}
