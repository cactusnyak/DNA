import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';

import { AuthController } from './auth.controller';
import { CurrentUserController } from './current-user.controller';
import { OAuthController } from './oauth.controller';
import { AuthService } from './auth.service';
import { OAuthService } from './oauth.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Module({
  imports: [UsersModule],
  controllers: [
    AuthController,
    CurrentUserController,
    OAuthController,
  ],
  providers: [
    AuthService,
    OAuthService,
    PasswordService,
    TokenService,
  ],
  exports: [AuthService],
})
export class AuthModule {}