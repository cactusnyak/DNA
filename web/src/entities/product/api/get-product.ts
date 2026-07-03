import type { Product } from '@/entities/product';
import { httpClient } from '@/shared/api/http-client';

export function getProduct(productId: string) {
  return httpClient<Product>(`/market/products/${productId}`);
}
