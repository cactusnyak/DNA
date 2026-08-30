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
    <aside className="overflow-hidden rounded-2xl shadow-card-3xl lg:sticky lg:top-28 lg:self-start bg-page">
      <div className="divide-y divide-border">
        {hasProducts && (
          <section className="grid gap-4 p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-2">
              <h2 className="font-semibold">Маркет</h2>
              <p className="text-right text-xs text-muted-foreground">
                К оплате
              </p>
              <p className="text-sm text-muted-foreground">
                {formatItemCount(totalProductItems, [
                  'товар',
                  'товара',
                  'товаров',
                ])}
              </p>
              <p className="whitespace-nowrap text-right text-2xl font-semibold">
                {formatPrice(totalProductAmount)}
              </p>
            </div>

            <Button asChild variant="accent" size="lg" className="w-full">
              <Link to="/checkout">Оформить заказ Маркета</Link>
            </Button>

            <p className="text-xs leading-5 text-muted-foreground">
              Заказ можно оформить без регистрации. Онлайн-оплата и доставка
              пока находятся в разработке.
            </p>
          </section>
        )}

        {hasAds && (
          <section className="grid gap-4 p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-2">
              <h2 className="font-semibold">Доска</h2>
              <p className="text-right text-xs text-muted-foreground">
                Указанная стоимость
              </p>
              <p className="text-sm text-muted-foreground">
                {formatItemCount(totalAdItems, [
                  'объявление',
                  'объявления',
                  'объявлений',
                ])}
              </p>
              <p className="whitespace-nowrap text-right text-xl font-semibold">
                {formatPrice(totalAdAmount)}
              </p>
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
