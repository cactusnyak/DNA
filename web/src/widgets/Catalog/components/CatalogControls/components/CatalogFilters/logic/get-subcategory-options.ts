import type { Product } from '@/entities/product';

import type { CatalogSubcategoryFilterOption } from '../types/catalog-filters';

export function getSubcategoryOptions(products: Product[]) {
  const optionByCategoryId = new Map<string, CatalogSubcategoryFilterOption>();

  products.forEach((product) => {
    const currentOption = optionByCategoryId.get(product.category.id);

    if (currentOption) {
      optionByCategoryId.set(product.category.id, {
        ...currentOption,
        productsCount: currentOption.productsCount + 1,
      });

      return;
    }

    optionByCategoryId.set(product.category.id, {
      id: product.category.id,
      name: product.category.name,
      productsCount: 1,
    });
  });

  return Array.from(optionByCategoryId.values()).sort((first, second) =>
    first.name.localeCompare(second.name, 'ru'),
  );
}