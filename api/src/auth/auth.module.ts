import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    AuthGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    AuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}