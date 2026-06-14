import type { Product } from '@/entities/product';

export function getPriceBounds(products: Product[]) {
  if (!products.length) {
    return {
      min: 0,
      max: 0,
    };
  }

  const prices = products.map((product) => product.price);

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}