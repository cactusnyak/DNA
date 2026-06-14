import { SectionHeader } from '@/components/ui/Section';
import { useCartStore } from '@/entities/cart';

import { CartEmptyState } from './components/CartEmptyState';
import { CartItemsList } from './components/CartItemsList';
import { CartSummary } from './components/CartSummary';

export function Cart() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalAmount = useCartStore((state) => state.getTotalAmount());

  if (!items.length) {
    return <CartEmptyState />;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Корзина"
        description="Проверьте товары, количество и сумму перед оформлением заказа."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <CartItemsList items={items} onRemove={removeItem} />

        <CartSummary
          totalItems={totalItems}
          totalAmount={totalAmount}
          onClear={clearCart}
        />
      </div>
    </div>
  );
}