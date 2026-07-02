import { orderStatuses } from '../../data/order-statuses';
import { SELECT_CLASS_NAME } from '../../data/select-class-name';
import type { AdminCrudFieldsProps } from '../../types/admin-crud-form';

export function OrderStatusCrudFields({
  values,
  onValueChange,
}: AdminCrudFieldsProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">Статус заказа</span>

      <select
        value={String(values.status ?? 'CREATED')}
        className={SELECT_CLASS_NAME}
        onChange={(event) => onValueChange('status', event.target.value)}
      >
        {orderStatuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </label>
  );
}
