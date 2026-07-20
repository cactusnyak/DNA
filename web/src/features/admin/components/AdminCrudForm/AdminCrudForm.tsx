import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { FormToggleField } from '@/components/ui/FormField';
import type { AdminAdCategory, AdminMarketCategory } from '@/entities/admin';

import { AdCategoryCrudFields } from './components/AdCategoryCrudFields';
import { AdCrudFields } from './components/AdCrudFields';
import { AdminCrudFormActions } from './components/AdminCrudFormActions';
import { CollectionCrudFields } from './components/CollectionCrudFields';
import { MarketCategoryCrudFields } from './components/MarketCategoryCrudFields';
import { OrderStatusCrudFields } from './components/OrderStatusCrudFields';
import { ProductCrudFields } from './components/ProductCrudFields';
import { UserCrudFields } from './components/UserCrudFields';
import { buildAdminCrudPayload } from './logic/build-admin-crud-payload';
import { getAdminCrudInitialValues } from './logic/get-admin-crud-initial-values';
import type {
  AdminCrudPayload,
  AdminCrudRecord,
  AdminCrudUpdateValue,
  AdminImageUploader,
} from './types/admin-crud-form';

import type { AdminManagementTabId } from '../../types/admin-management';

type AdminCrudFormProps = {
  tabId: AdminManagementTabId;
  record?: AdminCrudRecord;
  categories: AdminMarketCategory[];
  adCategories: AdminAdCategory[];
  isPending?: boolean;
  onUploadImage: AdminImageUploader;
  onSubmit: (payload: AdminCrudPayload) => void | Promise<void>;
  onCancel: () => void;
};

const TABS_WITHOUT_ACTIVE_TOGGLE: AdminManagementTabId[] = ['orders', 'users'];

export function AdminCrudForm({
  tabId,
  record,
  categories,
  adCategories,
  isPending = false,
  onUploadImage,
  onSubmit,
  onCancel,
}: AdminCrudFormProps) {
  const initialValues = useMemo(
    () => getAdminCrudInitialValues(tabId, record),
    [tabId, record],
  );

  const [values, setValues] = useState(initialValues);
  const [submitError, setSubmitError] = useState<string>();
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  useEffect(() => {
    setValues(initialValues);
    setSubmitError(undefined);
  }, [initialValues]);

  const updateValue: AdminCrudUpdateValue = (field, value) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(undefined);
    setIsUploadingImages(true);

    try {
      const payload = await buildAdminCrudPayload({
        tabId,
        values,
        uploadImage: onUploadImage,
      });

      await onSubmit(payload);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Не удалось сохранить запись.',
      );
    } finally {
      setIsUploadingImages(false);
    }
  }

  const fieldsProps = {
    tabId,
    values,
    categories,
    adCategories,
    record,
    onValueChange: updateValue,
  };

  const isFormPending = isPending || isUploadingImages;
  const showActiveToggle = !TABS_WITHOUT_ACTIVE_TOGGLE.includes(tabId);

  return (
    <form
      className="flex max-h-full flex-1 flex-col overflow-hidden"
      onSubmit={handleSubmit}
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="flex flex-col gap-6 p-6">
          {tabId === 'market-categories' && (
            <MarketCategoryCrudFields {...fieldsProps} />
          )}
          {tabId === 'market-products' && <ProductCrudFields {...fieldsProps} />}
          {tabId === 'collections' && <CollectionCrudFields {...fieldsProps} />}
          {tabId === 'ad-categories' && (
            <AdCategoryCrudFields {...fieldsProps} />
          )}
          {tabId === 'ads' && <AdCrudFields {...fieldsProps} />}
          {tabId === 'users' && <UserCrudFields {...fieldsProps} />}
          {tabId === 'orders' && <OrderStatusCrudFields {...fieldsProps} />}

          {showActiveToggle && (
            <FormToggleField
              label="Статус активности"
              caption="Неактивные записи можно скрывать из публичного каталога."
              checked={Boolean(values.isActive)}
              disabled={isFormPending}
              onCheckedChange={(checked) => updateValue('isActive', checked)}
            />
          )}

          {submitError && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {submitError}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-background p-6">
        <AdminCrudFormActions isPending={isFormPending} onCancel={onCancel} />
      </div>
    </form>
  );
}
