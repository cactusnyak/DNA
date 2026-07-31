import { Module } from '@nestjs/common';

import { EmailModule } from '../../email/email.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from '../../users/users.module';
import { AuthCapabilitiesModule } from '../capabilities/auth-capabilities.module';
import { PasswordHasherService } from '../password/password-hasher.service';
import { TokenModule } from '../token.module';
import { AuthTokenService } from '../tokens/auth-token.service';

import { EmailAuthController } from './email-auth.controller';
import { EmailAuthService } from './email-auth.service';

@Module({
  imports: [
    UsersModule,
    TokenModule,
    PrismaModule,
    AuthCapabilitiesModule,
    EmailModule,
  ],
  controllers: [EmailAuthController],
  providers: [EmailAuthService, AuthTokenService, PasswordHasherService],
})
export class EmailAuthModule {}
