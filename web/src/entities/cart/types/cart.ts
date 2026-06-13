import type { CartItem } from './cart-item';

export type Cart = {
  userId?: string;
  guestSessionId?: string;
  items: CartItem[];
};