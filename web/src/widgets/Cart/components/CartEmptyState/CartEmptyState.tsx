import { ShoppingCart } from 'lucide-react';

import { StateCard } from '@/components/ui/StateCard';

export function CartEmptyState() {
  return (
    <StateCard
      icon={ShoppingCart}
      title="Корзина пуста"
      description="Добавьте товары из каталога, а потом возвращайтесь сюда. Корзина без товаров, конечно, концептуальна, но бизнесу от этого грустно."
      action={{
        label: 'Перейти в каталог',
        to: '/market/catalog',
      }}
    />
  );
}