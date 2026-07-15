import { useState } from 'react';

import { SectionHeader } from '@/components/ui/Section';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useCartStore } from '@/entities/cart';

import { CartAdItemsList } from './components/CartAdItemsList/CartAdItemsList';
import { CartEmptyState } from './components/CartEmptyState';
import { CartItemsList } from './components/CartItemsList';
import { CartSummary } from './components/CartSummary';

type Tab = 'products' | 'ads';

export function Cart() {
  const [tab, setTab] = useState<Tab>('products');
  const items = useCartStore((state) => state.items);
  const adItems = useCartStore((state) => state.adItems);
  const removeItem = useCartStore((state) => state.removeItem);
  const removeAdItem = useCartStore((state) => state.removeAdItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalProductItems = useCartStore((state) => state.getTotalItems());
  const totalProductAmount = useCartStore((state) => state.getTotalAmount());
  const totalAdItems = useCartStore((state) => state.getTotalAdItems());
  const totalAdAmount = useCartStore((state) => state.getTotalAdAmount());

  if (!items.length && !adItems.length) {
    return <CartEmptyState />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Корзина"
        description="Проверьте товары и объявления перед оформлением."
      />

      <SegmentedControl
        options={[
          { value: 'products', label: `Товары${items.length > 0 ? ` (${items.length})` : ''}` },
          { value: 'ads', label: `Объявления${adItems.length > 0 ? ` (${adItems.length})` : ''}` },
        ]}
        value={tab}
        onChange={(v) => setTab(v as Tab)}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          {tab === 'products' && items.length > 0 && (
            <CartItemsList items={items} onRemove={removeItem} />
          )}

          {tab === 'products' && items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              В корзине нет товаров маркета.
            </p>
          )}

          {tab === 'ads' && adItems.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Для покупки свяжитесь с продавцом напрямую.
              </p>
              <CartAdItemsList adItems={adItems} onRemove={removeAdItem} />
            </div>
          )}

          {tab === 'ads' && adItems.length === 0 && (
            <p className="text-sm text-muted-foreground">
              В корзине нет объявлений.
            </p>
          )}
        </div>

        <CartSummary
          totalProductItems={totalProductItems}
          totalProductAmount={totalProductAmount}
          totalAdItems={totalAdItems}
          totalAdAmount={totalAdAmount}
          onClear={clearCart}
        />
      </div>
    </div>
  );
}