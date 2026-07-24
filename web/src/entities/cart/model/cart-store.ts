import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Ad } from '@/entities/ad';
import type { Product, SelectedProductAddition } from '@/entities/product';
import {
  calculateProductAdditionsTotal,
  createCartConfigurationKey,
} from '@/entities/product/lib/product-additions';

export type CartStoreItem = {
  product: Product;
  quantity: number;
  selectedAdditions: SelectedProductAddition[];
  configurationKey: string;
  configuredUnitPrice: number;
};

export type CartAdItem = {
  ad: Ad;
};

type CartStore = {
  items: CartStoreItem[];
  adItems: CartAdItem[];
  addItem: (product: Product, selectedAdditions?: SelectedProductAddition[]) => void;
  removeItem: (configurationKey: string) => void;
  increaseItem: (configurationKey: string) => void;
  decreaseItem: (configurationKey: string) => void;
  setItemQuantity: (configurationKey: string, quantity: number) => void;
  clearCart: () => void;
  clearAdItems: () => void;
  getItemQuantity: (productId: string) => number;
  getTotalItems: () => number;
  getTotalAmount: () => number;
  getTotalAdItems: () => number;
  getTotalAdAmount: () => number;
  addAdItem: (ad: Ad) => void;
  removeAdItem: (adId: string) => void;
  hasAdItem: (adId: string) => boolean;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      adItems: [],

      addAdItem: (ad) => {
        if (get().hasAdItem(ad.id)) return;
        set((state) => ({ adItems: [...state.adItems, { ad }] }));
      },

      removeAdItem: (adId) => {
        set((state) => ({
          adItems: state.adItems.filter((i) => i.ad.id !== adId),
        }));
      },

      hasAdItem: (adId) => {
        return get().adItems.some((i) => i.ad.id === adId);
      },

      addItem: (product, selectedAdditions = []) => {
        const configurationKey = createCartConfigurationKey(
          product.id,
          selectedAdditions,
        );
        const currentItem = get().items.find(
          (item) => item.configurationKey === configurationKey,
        );

        if (currentItem) {
          get().increaseItem(configurationKey);
          return;
        }

        set((state) => ({
          items: [
            ...state.items,
            {
              product,
              quantity: 1,
              selectedAdditions,
              configurationKey,
              configuredUnitPrice:
                product.price +
                calculateProductAdditionsTotal(
                  product.additions ?? [],
                  selectedAdditions,
                ),
            },
          ],
        }));
      },

      removeItem: (configurationKey) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.configurationKey !== configurationKey,
          ),
        }));
      },

      increaseItem: (configurationKey) => {
        set((state) => ({
          items: state.items.map((item) =>
            (item.configurationKey ?? item.product.id) === configurationKey ||
            item.product.id === configurationKey
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        }));
      },

      decreaseItem: (configurationKey) => {
        const currentItem = get().items.find(
          (item) =>
            (item.configurationKey ?? item.product.id) === configurationKey ||
            item.product.id === configurationKey,
        );

        if (!currentItem) {
          return;
        }

        if (currentItem.quantity <= 1) {
          get().removeItem(configurationKey);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            (item.configurationKey ?? item.product.id) === configurationKey ||
            item.product.id === configurationKey
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          ),
        }));
      },

      setItemQuantity: (configurationKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(configurationKey);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            (item.configurationKey ?? item.product.id) === configurationKey ||
            item.product.id === configurationKey
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

      clearAdItems: () => {
        set({
          adItems: [],
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
          (sum, item) =>
            sum +
            (item.configuredUnitPrice ?? item.product.price) * item.quantity,
          0,
        );
      },

      getTotalAdItems: () => {
        return get().adItems.length;
      },

      getTotalAdAmount: () => {
        return get().adItems.reduce((sum, item) => sum + item.ad.price, 0);
      },
    }),
    {
      name: 'dna-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        adItems: state.adItems,
      }),
    },
  ),
);
