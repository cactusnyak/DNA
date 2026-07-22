import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/shared/utils/format-price';

type CartSummaryProps = {
  totalProductItems: number;
  totalProductAmount: number;
  totalAdItems: number;
  totalAdAmount: number;
};

function formatItemCount(
  count: number,
  forms: [singular: string, few: string, many: string],
) {
  const remainder100 = count % 100;
  const remainder10 = count % 10;

  if (remainder100 >= 11 && remainder100 <= 14) {
    return `${count} ${forms[2]}`;
  }

  if (remainder10 === 1) {
    return `${count} ${forms[0]}`;
  }

  if (remainder10 >= 2 && remainder10 <= 4) {
    return `${count} ${forms[1]}`;
  }

  return `${count} ${forms[2]}`;
}

export function CartSummary({
  totalProductItems,
  totalProductAmount,
  totalAdItems,
  totalAdAmount,
}: CartSummaryProps) {
  const hasProducts = totalProductItems > 0;
  const hasAds = totalAdItems > 0;

  return (
    <aside className="overflow-hidden rounded-2xl border border-border bg-card lg:sticky lg:top-28 lg:self-start">
      <div className="divide-y divide-border">
        {hasProducts && (
          <section className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold">Маркет</h2>
                <p className="text-sm text-muted-foreground">
                  {formatItemCount(totalProductItems, [
                    'товар',
                    'товара',
                    'товаров',
                  ])}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-muted-foreground">К оплате</p>
                <p className="text-2xl font-semibold">
                  {formatPrice(totalProductAmount)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Доставка</span>
              <span className="text-muted-foreground">Не подключена</span>
            </div>

            <Button asChild size="lg" className="w-full">
              <Link to="/checkout">Оформить заказ Маркета</Link>
            </Button>

            <p className="text-xs leading-5 text-muted-foreground">
              Заказ можно оформить без регистрации. Онлайн-оплата и доставка
              пока находятся в разработке.
            </p>
          </section>
        )}

        {hasAds && (
          <section className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold">Доска</h2>
                <p className="text-sm text-muted-foreground">
                  {formatItemCount(totalAdItems, [
                    'объявление',
                    'объявления',
                    'объявлений',
                  ])}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Указанная стоимость
                </p>
                <p className="text-xl font-semibold">
                  {formatPrice(totalAdAmount)}
                </p>
              </div>
            </div>

            <p className="text-sm leading-6 text-muted-foreground">
              Оплата и условия сделки обсуждаются с продавцами напрямую.
            </p>
          </section>
        )}
      </div>
    </aside>
  );
}
