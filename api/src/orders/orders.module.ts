import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DeliveryProvidersModule } from '../delivery-providers/delivery-providers.module';
import { RewardsModule } from '../rewards/rewards.module';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [PrismaModule, AuthModule, DeliveryProvidersModule, RewardsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
