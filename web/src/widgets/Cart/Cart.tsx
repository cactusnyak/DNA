import { SectionHeader } from '@/components/ui/Section';
import { useCartStore } from '@/entities/cart';

import { CartAdItemsList } from './components/CartAdItemsList/CartAdItemsList';
import { CartEmptyState } from './components/CartEmptyState';
import { CartItemsList } from './components/CartItemsList';
import { CartSummary } from './components/CartSummary';

export function Cart() {
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
    <div className="space-y-8">
      <SectionHeader
        title="Корзина"
        description="Проверьте товары и объявления перед оформлением."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          {items.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Товары маркета</h2>
              <CartItemsList items={items} onRemove={removeItem} />
            </section>
          )}

          {adItems.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Объявления</h2>
              <p className="text-sm text-muted-foreground">
                Для покупки свяжитесь с продавцом напрямую.
              </p>
              <CartAdItemsList adItems={adItems} onRemove={removeAdItem} />
            </section>
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