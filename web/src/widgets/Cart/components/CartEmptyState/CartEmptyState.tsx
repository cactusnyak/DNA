import { ShoppingCart } from 'lucide-react';

import { StateCard } from '@/components/ui/StateCard';

export function CartEmptyState() {
  return (
    <StateCard
      icon={ShoppingCart}
      title="Корзина пуста"
      description="Добавьте товары из каталога Маркета или сохраните объявления Доски."
      action={{
        label: 'Перейти в каталог',
        to: '/market/catalog',
      }}
    />
  );
}
