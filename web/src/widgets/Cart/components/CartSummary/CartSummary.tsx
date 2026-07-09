import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/shared/utils/format-price';

type CartSummaryProps = {
  totalProductItems: number;
  totalProductAmount: number;
  totalAdItems: number;
  totalAdAmount: number;
  onClear: () => void;
};

export function CartSummary({
  totalProductItems,
  totalProductAmount,
  totalAdItems,
  totalAdAmount,
  onClear,
}: CartSummaryProps) {
  const grandTotal = totalProductAmount + totalAdAmount;
  const hasProducts = totalProductItems > 0;
  const hasAds = totalAdItems > 0;

  return (
    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Итого</h2>

        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {hasProducts && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                Маркет ({totalProductItems} шт.)
              </span>
              <span className="font-medium">{formatPrice(totalProductAmount)}</span>
            </div>
          )}

          {hasAds && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                Объявления ({totalAdItems} шт.)
              </span>
              <span className="font-medium">{formatPrice(totalAdAmount)}</span>
            </div>
          )}

          {hasProducts && hasAds && (
            <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
              <span className="text-sm font-medium">Общая сумма</span>
              <span className="text-2xl font-semibold">{formatPrice(grandTotal)}</span>
            </div>
          )}

          {!(hasProducts && hasAds) && (
            <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">К оплате</span>
              <span className="text-2xl font-semibold">{formatPrice(grandTotal)}</span>
            </div>
          )}
        </div>
      </div>

      {hasProducts && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold">Товары маркета</h3>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Сумма</span>
              <span className="font-medium">{formatPrice(totalProductAmount)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Доставка</span>
              <span className="text-sm text-muted-foreground">уточняется</span>
            </div>
          </div>

          <Button asChild size="lg" className="w-full">
            <Link to="/checkout">Оформить заказ</Link>
          </Button>

          <p className="text-xs text-muted-foreground">
            Заказ можно оформить без регистрации.
          </p>
        </div>
      )}

      {hasAds && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
          <h3 className="font-semibold">Объявления</h3>
          <p className="text-sm text-muted-foreground">
            Свяжитесь с продавцами напрямую по контактам в карточках.
          </p>
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onClear}
      >
        Очистить корзину
      </Button>
    </aside>
  );
}