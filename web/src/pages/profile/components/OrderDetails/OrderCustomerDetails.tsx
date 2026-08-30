import type { Order } from '@/entities/order';

type OrderCustomerDetailsProps = {
  customer: Pick<
    Order,
    | 'customerName'
    | 'customerPhone'
    | 'customerEmail'
    | 'deliveryAddress'
    | 'delivery'
  >;
};

const detailClassName = 'flex flex-col gap-0.5';

export function OrderCustomerDetails({ customer }: OrderCustomerDetailsProps) {
  return (
    <dl className="flex flex-col gap-4">
      <div className={detailClassName}>
        <dt className="text-xs text-muted-foreground">Имя</dt>
        <dd className="text-md">{customer.customerName}</dd>
      </div>

      <div className={detailClassName}>
        <dt className="text-xs text-muted-foreground">Телефон</dt>
        <dd className="text-md">{customer.customerPhone}</dd>
      </div>

      <div className={detailClassName}>
        <dt className="text-xs text-muted-foreground">Email</dt>
        <dd className="text-md">{customer.customerEmail || '—'}</dd>
      </div>

      <div className={detailClassName}>
        <dt className="text-xs text-muted-foreground">Адрес доставки</dt>
        <dd className="text-md">
          {customer.delivery.destination?.fullAddress ?? customer.deliveryAddress}
        </dd>
      </div>
    </dl>
  );
}
