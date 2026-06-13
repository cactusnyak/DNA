import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Product } from '@/entities/product';

export type CartStoreItem = {
  product: Product;
  quantity: number;
};

type CartStore = {
  items: CartStoreItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  increaseItem: (productId: string) => void;
  decreaseItem: (productId: string) => void;
  setItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  getTotalItems: () => number;
  getTotalAmount: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const currentItem = get().items.find(
          (item) => item.product.id === product.id,
        );

        if (currentItem) {
          get().increaseItem(product.id);
          return;
        }

        set((state) => ({
          items: [
            ...state.items,
            {
              product,
              quantity: 1,
            },
          ],
        }));
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      increaseItem: (productId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        }));
      },

      decreaseItem: (productId) => {
        const currentItem = get().items.find(
          (item) => item.product.id === productId,
        );

        if (!currentItem) {
          return;
        }

        if (currentItem.quantity <= 1) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          ),
        }));
      },

      setItemQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity }
              : item,
          ),
        }));
      },

      clearCart: () => {
        set({
          items: [],
        });
      },

      getItemQuantity: (productId) => {
        return (
          get().items.find((item) => item.product.id === productId)?.quantity ??
          0
        );
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalAmount: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        );
      },
    }),
    {
      name: 'dna-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
);