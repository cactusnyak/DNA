import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

export function CheckoutEmptyState() {
  return (
    <section className="mx-auto flex max-w-xl flex-col gap-4 rounded-2xl border border-border/80 bg-card p-8 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Оформлять пока нечего</h1>

        <p className="text-sm text-muted-foreground">
          Корзина пуста. Добавьте товары, а потом возвращайтесь к оформлению.
          Да, даже заказу нужно из чего-то состоять.
        </p>
      </div>

      <Button asChild variant="accent">
        <Link to="/market/catalog">Перейти в каталог</Link>
      </Button>
    </section>
  );
}
