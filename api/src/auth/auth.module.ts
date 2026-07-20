import { Module } from '@nestjs/common';

import { CurrentUserModule } from './current-user.module';
import { OAuthModule } from './oauth.module';
import { OtpModule } from './otp.module';

@Module({
  imports: [CurrentUserModule, OAuthModule, OtpModule],
  exports: [CurrentUserModule],
})
export class AuthModule {}