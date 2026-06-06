import type { Product } from '@/entities/product';
import { httpClient } from '@/shared/api/http-client';

type GetProductsParams = {
  categorySlug?: string;
};

export function getProducts(params: GetProductsParams = {}) {
  return httpClient<Product[]>('/products', {
    query: {
      category: params.categorySlug,
    },
  });
}