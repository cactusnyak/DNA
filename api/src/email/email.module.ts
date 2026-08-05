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
      ) => {
        const provider = config.get<string>('EMAIL_DELIVERY_PROVIDER');
        if (provider === 'resend') return resendProvider;
        if (provider === 'console') return consoleProvider;
        throw new Error(`Unsupported email delivery provider: ${provider}`);
      },
    },
  ],
  exports: [EMAIL_DELIVERY_PROVIDER, AuthEmailSenderService],
})
export class EmailModule {}
