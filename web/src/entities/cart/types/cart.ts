import type { CartItem } from './cart-item';

export type Cart = {
  userId: string;
  items: CartItem[];
};