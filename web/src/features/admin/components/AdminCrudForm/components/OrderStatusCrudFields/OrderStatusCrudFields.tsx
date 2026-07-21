import { FormSelectField } from '@/components/ui/FormField';

import { orderStatuses } from '../../data/order-statuses';
import type { AdminCrudFieldsProps } from '../../types/admin-crud-form';

const orderStatusOptions = orderStatuses.map((status) => ({
  value: status,
  label: status,
}));

export function OrderStatusCrudFields({
  values,
  onValueChange,
}: AdminCrudFieldsProps) {
  return (
    <FormSelectField
      label="Статус заказа"
      value={String(values.status ?? 'CREATED')}
      options={orderStatusOptions}
      onValueChange={(value) => onValueChange('status', value)}
    />
  );
}
