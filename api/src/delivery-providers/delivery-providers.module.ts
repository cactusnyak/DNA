import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DeliveryProviderRegistry } from './delivery-provider.registry';
import { DeliveryGroupResolver } from './delivery-group.resolver';
import { DeliveryPlanBuilder } from './delivery-plan.builder';
import { DeliveryLocationResolver } from './delivery-location.resolver';
import { OrderDeliveryInvalidationService } from './order-delivery-invalidation.service';
import { DeliveryQuoteOrchestrator } from './delivery-quote.orchestrator';
import { OrderDeliveryQuotesController } from './delivery-quotes.controller';
import { OrderDeliveryController } from './order-delivery.controller';
import { OrderDeliveryService } from './order-delivery.service';
import { EffectiveShippingProfileResolver } from './effective-shipping-profile.resolver';
import { YandexCargoClient } from './yandex/cargo/yandex-cargo.client';
import { YandexDeliveryAdapter } from './yandex/yandex-delivery.adapter';
import { YandexDeliveryConfig } from './yandex/yandex-delivery.config';
import { YandexHttpClient } from './yandex/yandex-http.client';
import { YandexMockClient } from './yandex/yandex-mock.client';
import { YandexRussiaClient } from './yandex/russia/yandex-russia.client';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [OrderDeliveryQuotesController, OrderDeliveryController],
  providers: [
    DeliveryGroupResolver,
    DeliveryPlanBuilder,
    DeliveryLocationResolver,
    OrderDeliveryInvalidationService,
    OrderDeliveryService,
    DeliveryProviderRegistry,
    DeliveryQuoteOrchestrator,
    EffectiveShippingProfileResolver,
    YandexDeliveryConfig,
    YandexHttpClient,
    YandexMockClient,
    YandexCargoClient,
    YandexRussiaClient,
    YandexDeliveryAdapter,
  ],
  exports: [
    DeliveryProviderRegistry,
    DeliveryQuoteOrchestrator,
    OrderDeliveryService,
    OrderDeliveryInvalidationService,
  ],
})
export class DeliveryProvidersModule {}
