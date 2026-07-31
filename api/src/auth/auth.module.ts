import { Module } from '@nestjs/common';

import { AuthCapabilitiesModule } from './capabilities/auth-capabilities.module';
import { CurrentUserModule } from './current-user.module';
import { EmailAuthModule } from './email/email-auth.module';
import { OAuthModule } from './oauth.module';
import { OtpModule } from './otp.module';

@Module({
  imports: [
    CurrentUserModule,
    OAuthModule,
    OtpModule,
    AuthCapabilitiesModule,
    EmailAuthModule,
  ],
  exports: [CurrentUserModule],
})
export class AuthModule {}