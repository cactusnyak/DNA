import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';

import { AuthController } from './auth.controller';
import { CurrentUserController } from './current-user.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Module({
  imports: [UsersModule],
  controllers: [
    AuthController,
    CurrentUserController,
  ],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
  ],
  exports: [AuthService],
})
export class AuthModule {}