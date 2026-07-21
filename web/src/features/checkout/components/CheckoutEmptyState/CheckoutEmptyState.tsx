import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

export function CheckoutEmptyState() {
  return (
    <section className="mx-auto max-w-xl space-y-4 rounded-2xl border border-border bg-card p-8 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Оформлять пока нечего</h1>

        <p className="text-sm text-muted-foreground">
          Корзина пуста. Добавьте товары, а потом возвращайтесь к оформлению.
          Да, даже заказу нужно из чего-то состоять.
        </p>
      </div>

      <Button asChild>
        <Link to="/market/catalog">Перейти в каталог</Link>
      </Button>
    </section>
  );
}