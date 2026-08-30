import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DeliveryProvidersModule } from '../delivery-providers/delivery-providers.module';
import { RewardsModule } from '../rewards/rewards.module';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [PrismaModule, AuthModule, DeliveryProvidersModule, RewardsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
