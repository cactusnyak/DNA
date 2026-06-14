import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/shared/utils/format-price';

type CartSummaryProps = {
  totalItems: number;
  totalAmount: number;
  onClear: () => void;
};

export function CartSummary({
  totalItems,
  totalAmount,
  onClear,
}: CartSummaryProps) {
  return (
    <aside className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-28 lg:self-start">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Итого</h2>

        <p className="text-sm text-muted-foreground">
          {totalItems} товар(ов) в корзине
        </p>
      </div>

      <div className="mt-5 space-y-3 border-t border-border pt-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Сумма товаров</span>

          <span className="font-medium">{formatPrice(totalAmount)}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Доставка</span>

          <span className="text-sm text-muted-foreground">
            уточняется
          </span>
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">К оплате</span>

          <span className="text-2xl font-semibold">
            {formatPrice(totalAmount)}
          </span>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Заказ можно оформить без регистрации. Аккаунт понадобится только для
          истории, кешбэка и заработка.
        </p>
      </div>

      <div className="mt-5 space-y-2">
        <Button asChild size="lg" className="w-full">
          <Link to="/checkout">Оформить заказ</Link>
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onClear}
        >
          Очистить корзину
        </Button>
      </div>
    </aside>
  );
}