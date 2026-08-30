import type { Product } from '@/entities/product';
import { formatPrice } from '@/shared/utils/format-price';

export function RewardPreview({
  preview,
  compact = false,
}: {
  preview: Product['rewardPreview'];
  compact?: boolean;
}) {
  if (!preview?.available) return null;
  if (compact) {
    return (
      <p className="mt-1 text-xs font-medium text-primary">
        Бонусный фонд: {formatPrice(preview.fundAmount)}
      </p>
    );
  }
  return (
    <section className="rounded-2xl bg-primary/5 p-4">
      <p className="font-semibold">Бонусный фонд этой покупки: {formatPrice(preview.fundAmount)}</p>
      <p className="mt-1 text-xs text-muted-foreground">{preview.priceCategory} · до 5% от цены</p>
      <dl className="mt-3 grid gap-1 text-sm">
        {preview.breakdown.map((item) => (
          <div key={item.depth} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{item.label}</dt>
            <dd className="font-medium">{formatPrice(item.amount)}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        Бонусы становятся доступны после полной доставки и используются только для оплаты части товаров в DNA.
      </p>
    </section>
  );
}
