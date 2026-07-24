import { useState } from 'react';
import type { Product } from '@/entities/product';
import type { SelectedProductAddition } from '@/entities/product';
import {
  calculateProductAdditionsTotal,
  createDefaultSelectedAdditions,
  validateSelectedProductAdditions,
} from '@/entities/product/lib/product-additions';
import { formatPrice } from '@/shared/utils/format-price';
import { Gallery } from '@/widgets/Gallery';

import { ProductDetailsActions } from './components/ProductDetailsActions';
import { ProductDetailsInfo } from './components/ProductDetailsInfo';
import { ProductAdditionsSelector } from './components/ProductAdditionsSelector/ProductAdditionsSelector';

type ProductDetailsProps = {
  product: Product;
};

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedAdditions, setSelectedAdditions] = useState<SelectedProductAddition[]>(
    () => createDefaultSelectedAdditions(product.additions ?? []),
  );
  const [showErrors, setShowErrors] = useState(false);
  const errors = validateSelectedProductAdditions(
    product.additions ?? [],
    selectedAdditions,
  );
  const configuredUnitPrice =
    product.price +
    calculateProductAdditionsTotal(product.additions ?? [], selectedAdditions);
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Gallery images={product.images} title={product.title} />

      <div className="space-y-6">
        <ProductDetailsInfo product={product} />
        <ProductAdditionsSelector
          additions={product.additions ?? []}
          selected={selectedAdditions}
          errors={showErrors ? errors : {}}
          onChange={setSelectedAdditions}
        />
        {(product.additions?.length ?? 0) > 0 && (
          <p className="text-xl font-semibold">
            Итого за единицу: {formatPrice(configuredUnitPrice)}
          </p>
        )}
        <ProductDetailsActions
          product={product}
          selectedAdditions={selectedAdditions}
          isConfigurationValid={Object.keys(errors).length === 0}
          onInvalidConfiguration={() => setShowErrors(true)}
        />
      </div>
    </div>
  );
}
