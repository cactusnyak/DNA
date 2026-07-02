import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { FormToggleField } from '@/components/ui/FormField';
import type { AdminCategory } from '@/entities/admin';

import { AdminCrudFormActions } from './components/AdminCrudFormActions';
import { CategoryCrudFields } from './components/CategoryCrudFields';
import { CollectionCrudFields } from './components/CollectionCrudFields';
import { OrderStatusCrudFields } from './components/OrderStatusCrudFields';
import { ProductCrudFields } from './components/ProductCrudFields';
import { buildAdminCrudPayload } from './logic/build-admin-crud-payload';
import { getAdminCrudInitialValues } from './logic/get-admin-crud-initial-values';
import type {
  AdminCrudPayload,
  AdminCrudRecord,
  AdminCrudUpdateValue,
} from './types/admin-crud-form';

import type { AdminManagementTabId } from '../../types/admin-management';

type AdminCrudFormProps = {
  tabId: AdminManagementTabId;
  record?: AdminCrudRecord;
  categories: AdminCategory[];
  isPending?: boolean;
  onSubmit: (payload: AdminCrudPayload) => void | Promise<void>;
  onCancel: () => void;
};

export function AdminCrudForm({
  tabId,
  record,
  categories,
  isPending = false,
  onSubmit,
  onCancel,
}: AdminCrudFormProps) {
  const initialValues = useMemo(
    () => getAdminCrudInitialValues(tabId, record),
    [tabId, record],
  );

  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const updateValue: AdminCrudUpdateValue = (field, value) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(buildAdminCrudPayload(tabId, values));
  }

  const fieldsProps = {
    tabId,
    values,
    categories,
    record,
    onValueChange: updateValue,
  };

  return (
    <form
      className="flex max-h-full flex-1 flex-col overflow-hidden"
      onSubmit={handleSubmit}
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="flex flex-col gap-6 p-6">
          {tabId === 'categories' && <CategoryCrudFields {...fieldsProps} />}
          {tabId === 'products' && <ProductCrudFields {...fieldsProps} />}
          {tabId === 'collections' && <CollectionCrudFields {...fieldsProps} />}
          {tabId === 'orders' && <OrderStatusCrudFields {...fieldsProps} />}

          {tabId !== 'orders' && (
            <FormToggleField
              label="Статус активности"
              caption="Неактивные записи можно скрывать из публичного каталога."
              checked={Boolean(values.isActive)}
              onCheckedChange={(checked) => updateValue('isActive', checked)}
            />
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-background p-6">
        <AdminCrudFormActions isPending={isPending} onCancel={onCancel} />
      </div>
    </form>
  );
}