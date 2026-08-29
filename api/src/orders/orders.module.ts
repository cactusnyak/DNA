import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DeliveryProvidersModule } from '../delivery-providers/delivery-providers.module';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [PrismaModule, AuthModule, DeliveryProvidersModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
