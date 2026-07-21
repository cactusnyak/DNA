import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { TokenModule } from './token.module';

@Module({
  imports: [NotificationsModule, PrismaModule, UsersModule, TokenModule],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
