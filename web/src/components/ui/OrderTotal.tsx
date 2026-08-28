import { formatPrice } from '@/shared/utils/format-price';

type OrderTotalProps = {
  amount: number;
};

export function OrderTotal({ amount }: OrderTotalProps) {
  return (
    <section className="flex items-center">
      <h2 className="text-lg font-semibold">
        Итого к оплате:{' '}
        <span className="font-semibold text-primary">
          {formatPrice(amount)}
        </span>
      </h2>
    </section>
  );
}
