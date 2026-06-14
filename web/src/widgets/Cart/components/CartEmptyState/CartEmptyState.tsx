import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/Button';

export function CartEmptyState() {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
        <ShoppingCart className="size-6 text-muted-foreground" />
      </div>

      <div className="mt-5 space-y-2">
        <h1 className="text-2xl font-semibold">Корзина пуста</h1>

        <p className="text-sm text-muted-foreground">
          Добавьте товары из каталога, а потом возвращайтесь сюда. Корзина без
          товаров, конечно, концептуальна, но бизнесу от этого грустно.
        </p>
      </div>

      <Button asChild className="mt-6">
        <Link to="/catalog">Перейти в каталог</Link>
      </Button>
    </section>
  );
}