import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

import { AuthController } from './auth.controller';
import { CurrentUserController } from './current-user.controller';
import { OAuthController } from './oauth.controller';
import { AuthService } from './auth.service';
import { OAuthService } from './oauth.service';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { TokenService } from './token.service';

@Module({
  imports: [UsersModule, PrismaModule, NotificationsModule],
  controllers: [
    AuthController,
    CurrentUserController,
    OAuthController,
    OtpController,
  ],
  providers: [
    AuthService,
    OAuthService,
    OtpService,
    TokenService,
  ],
  exports: [AuthService],
})
export class AuthModule {}