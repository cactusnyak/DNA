import { formatPrice } from '@/shared/utils/format-price';

type OrderTotalProps = {
  amount: number;
};

export function OrderTotal({ amount }: OrderTotalProps) {
  return (
    <section className="flex items-center gap-4 border-t border-border/80 pt-3">
      <h2 className="text-lg font-semibold">
        Итого к оплате:{' '}
        <span className="font-semibold text-primary">
          {formatPrice(amount)}
        </span>
      </h2>
    </section>
  );
}
