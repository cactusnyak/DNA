import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import {
  DeliveryQuotesController,
  AdminDeliveryQuotesController,
} from './delivery-quotes.controller';
import { DeliveryQuotesService } from './delivery-quotes.service';
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DeliveryQuotesController, AdminDeliveryQuotesController],
  providers: [DeliveryQuotesService],
  exports: [DeliveryQuotesService],
})
export class DeliveryQuotesModule {}
