import { formatPrice } from '@/shared/utils/format-price';

type DeliveryPlanHeaderProps = {
  title: string;
  customerPrice: number;
};

export function DeliveryPlanHeader({ title, customerPrice }: DeliveryPlanHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <span className="font-medium">{title}</span>
      <span className="font-semibold text-primary">
        {formatPrice(customerPrice)}
      </span>
    </div>
  );
}
