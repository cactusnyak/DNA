import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';
import {
  DeliveryQuotesController,
  AdminDeliveryQuotesController,
} from './delivery-quotes.controller';
import { DeliveryQuotesService } from './delivery-quotes.service';
import { DeliveryQuoteEmailService } from './delivery-quote-email.service';
@Module({
  imports: [PrismaModule, AuthModule, EmailModule],
  controllers: [DeliveryQuotesController, AdminDeliveryQuotesController],
  providers: [DeliveryQuotesService, DeliveryQuoteEmailService],
  exports: [DeliveryQuotesService],
})
export class DeliveryQuotesModule {}
