/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';

import { DeliveryProviderError } from './delivery-provider.error';
import type { DeliveryPackage } from './contracts/delivery-provider.types';

@Injectable()
export class EffectiveShippingProfileResolver {
  resolve(item: any): DeliveryPackage[] {
    const packages = item.product?.shippingProfile?.packages ?? [];
    if (!item.product?.shippingProfile)
      throw new DeliveryProviderError(
        'SHIPPING_PROFILE_REQUIRED',
        `Для товара «${item.productTitle ?? item.product?.title}» не настроен профиль перевозки.`,
      );
    if (!packages.length)
      throw new DeliveryProviderError(
        'PACKAGES_REQUIRED',
        `Для товара «${item.productTitle ?? item.product?.title}» не настроены упаковки.`,
      );
    return packages.map((profile: any) => {
      const values = [
        profile.quantity,
        profile.weightGrams,
        profile.lengthMillimeters,
        profile.widthMillimeters,
        profile.heightMillimeters,
      ];
      if (values.some((value) => !Number.isSafeInteger(value) || value <= 0))
        throw new DeliveryProviderError(
          'INVALID_PACKAGE_PROFILE',
          'Вес и габариты упаковки должны быть положительными целыми числами.',
        );
      return {
        orderItemId: item.id,
        productId: item.productId,
        sku: item.product.sku ?? undefined,
        quantity: item.quantity * profile.quantity,
        packageSequence: profile.sequence,
        type: profile.type,
        weightGrams: profile.weightGrams,
        lengthMillimeters: profile.lengthMillimeters,
        widthMillimeters: profile.widthMillimeters,
        heightMillimeters: profile.heightMillimeters,
      };
    });
  }
}
