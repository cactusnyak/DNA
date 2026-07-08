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
  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalAmount = useCartStore((state) => state.getTotalAmount());

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
            <CartItemsList items={items} onRemove={removeItem} />
          )}

          {adItems.length > 0 && (
            <CartAdItemsList adItems={adItems} onRemove={removeAdItem} />
          )}
        </div>

        {items.length > 0 && (
          <CartSummary
            totalItems={totalItems}
            totalAmount={totalAmount}
            onClear={clearCart}
          />
        )}
      </div>
    </div>
  );
}