import 'dotenv/config';

import { ConfigService } from '@nestjs/config';

import type { DeliveryQuoteRequest } from '../src/delivery-providers/contracts/delivery-provider.types';
import { YandexCargoClient } from '../src/delivery-providers/yandex/cargo/yandex-cargo.client';
import { YandexDeliveryConfig } from '../src/delivery-providers/yandex/yandex-delivery.config';
import { YandexHttpClient } from '../src/delivery-providers/yandex/yandex-http.client';
import { YandexMockClient } from '../src/delivery-providers/yandex/yandex-mock.client';
import { YandexRussiaClient } from '../src/delivery-providers/yandex/russia/yandex-russia.client';

const contour = process.argv
  .find((value) => value.startsWith('--contour='))
  ?.split('=')[1];
if (contour !== 'cargo' && contour !== 'russia')
  throw new Error('Use --contour=cargo or --contour=russia');

const config = new YandexDeliveryConfig(new ConfigService(process.env));
const mode = contour === 'cargo' ? config.expressMode : config.russiaMode;
if (
  mode === 'production' &&
  !process.argv.includes('--allow-production-quote')
) {
  throw new Error('Production quote smoke requires --allow-production-quote');
}

const request: DeliveryQuoteRequest = {
  correlationId: crypto.randomUUID(),
  groupKey: 'manual-smoke',
  serviceCodes:
    contour === 'cargo' ? ['YANDEX_EXPRESS'] : ['YANDEX_RUSSIA_DOOR'],
  warehouseExternalLocationId: config.russiaStationId || 'mock-station',
  origin: {
    country: 'Россия',
    city: 'Москва',
    fullAddress: 'Москва, улица Льва Толстого, 16',
    latitude: 55.733974,
    longitude: 37.587093,
    contactName: 'Тест',
    contactPhone: '+79990000000',
  },
  destination: {
    country: 'Россия',
    city: 'Москва',
    fullAddress: 'Москва, Красная площадь, 1',
    latitude: 55.75393,
    longitude: 37.620795,
    recipientName: 'Тест',
    recipientPhone: '+79990000001',
  },
  packages: [
    {
      orderItemId: 'smoke-item',
      productId: 'smoke-product',
      quantity: 1,
      packageSequence: 0,
      type: 'BOX',
      weightGrams: 1000,
      lengthMillimeters: 200,
      widthMillimeters: 150,
      heightMillimeters: 100,
    },
  ],
};

const mock = new YandexMockClient(config);
const http = new YandexHttpClient(config);
async function main() {
  const options =
    mode === 'mock'
      ? mock.calculate(request)
      : contour === 'cargo'
        ? await new YandexCargoClient(config, http).calculate(request)
        : await new YandexRussiaClient(config, http).calculate(request);

  console.log(
    options.map((option) => ({
      service: option.serviceCode,
      price: option.providerCost,
      interval: option.deliveryInterval,
      expiresAt: option.expiresAt.toISOString(),
    })),
  );
}

void main();
