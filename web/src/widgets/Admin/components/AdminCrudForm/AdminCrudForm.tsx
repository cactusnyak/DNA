import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Button } from '@/components/ui/Button';
import {
  FormInputField,
  FormTextareaField,
} from '@/components/ui/FormField';
import type {
  AdminCatalogCollection,
  AdminCatalogCollectionPayload,
  AdminCategory,
  AdminCategoryPayload,
  AdminProduct,
  AdminProductPayload,
} from '@/entities/admin';
import type { Order, OrderStatus } from '@/entities/order';

import type { AdminManagementTabId } from '../../types/admin-management';

type AdminCrudRecord =
  | AdminCategory
  | AdminProduct
  | AdminCatalogCollection
  | Order;

type AdminCrudPayload =
  | AdminCategoryPayload
  | AdminProductPayload
  | AdminCatalogCollectionPayload
  | { status: OrderStatus };

type AdminCrudFormProps = {
  tabId: AdminManagementTabId;
  record?: AdminCrudRecord;
  categories: AdminCategory[];
  isPending?: boolean;
  onSubmit: (payload: AdminCrudPayload) => void | Promise<void>;
  onCancel: () => void;
};

const SELECT_CLASS_NAME =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

const orderStatuses: OrderStatus[] = [
  'CREATED',
  'AWAITING_PAYMENT',
  'PAID',
  'SHIPPED',
  'DELIVERED',
  'CASHBACK_ACCRUED',
  'CANCELLED',
];

function getInitialValues(tabId: AdminManagementTabId, record?: AdminCrudRecord) {
  if (tabId === 'categories') {
    const category = record as AdminCategory | undefined;

    return {
      name: category?.name ?? '',
      slug: category?.slug ?? '',
      description: category?.description ?? '',
      parentId: category?.parentId ?? '',
      sortOrder: String(category?.sortOrder ?? 0),
      imageUrl: category?.image?.url ?? '',
      imageAlt: category?.image?.alt ?? '',
      isActive: category?.isActive ?? true,
    };
  }

  if (tabId === 'products') {
    const product = record as AdminProduct | undefined;

    return {
      title: product?.title ?? '',
      slug: product?.slug ?? '',
      description: product?.description ?? '',
      categoryId: product?.categoryId ?? '',
      price: String(product?.price ?? 0),
      imageUrls: product?.images.map((image) => image.url).join('\n') ?? '',
      isActive: product?.isActive ?? true,
    };
  }

  if (tabId === 'collections') {
    const collection = record as AdminCatalogCollection | undefined;

    return {
      title: collection?.title ?? '',
      slug: collection?.slug ?? '',
      type: collection?.type ?? 'CATEGORY',
      description: collection?.description ?? '',
      isActive: collection?.isActive ?? true,
    };
  }

  const order = record as Order | undefined;

  return {
    status: order?.status ?? 'CREATED',
  };
}

export function AdminCrudForm({
  tabId,
  record,
  categories,
  isPending = false,
  onSubmit,
  onCancel,
}: AdminCrudFormProps) {
  const initialValues = useMemo(
    () => getInitialValues(tabId, record),
    [tabId, record],
  );

  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  function updateValue(field: string, value: string | boolean) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (tabId === 'categories') {
      onSubmit({
        name: String(values.name ?? ''),
        slug: String(values.slug ?? ''),
        description: String(values.description ?? ''),
        parentId: String(values.parentId ?? ''),
        sortOrder: Number(values.sortOrder ?? 0),
        imageUrl: String(values.imageUrl ?? ''),
        imageAlt: String(values.imageAlt ?? ''),
        isActive: Boolean(values.isActive),
      });

      return;
    }

    if (tabId === 'products') {
      onSubmit({
        title: String(values.title ?? ''),
        slug: String(values.slug ?? ''),
        description: String(values.description ?? ''),
        categoryId: String(values.categoryId ?? ''),
        price: Number(values.price ?? 0),
        imageUrls: String(values.imageUrls ?? '')
          .split('\n')
          .map((imageUrl) => imageUrl.trim())
          .filter(Boolean),
        isActive: Boolean(values.isActive),
      });

      return;
    }

    if (tabId === 'collections') {
      onSubmit({
        title: String(values.title ?? ''),
        slug: String(values.slug ?? ''),
        type: values.type === 'PRODUCT' ? 'PRODUCT' : 'CATEGORY',
        description: String(values.description ?? ''),
        isActive: Boolean(values.isActive),
      });

      return;
    }

    onSubmit({
      status: values.status as OrderStatus,
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {tabId === 'categories' && (
        <div className="grid gap-4 md:grid-cols-2">
          <FormInputField
            required
            label="Название"
            value={String(values.name ?? '')}
            onChange={(event) => updateValue('name', event.target.value)}
          />

          <FormInputField
            label="Slug"
            caption="Можно оставить пустым, система создаст сама."
            value={String(values.slug ?? '')}
            onChange={(event) => updateValue('slug', event.target.value)}
          />

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Родительская категория</span>

            <select
              value={String(values.parentId ?? '')}
              className={SELECT_CLASS_NAME}
              onChange={(event) => updateValue('parentId', event.target.value)}
            >
              <option value="">Без родителя</option>

              {categories
                .filter((category) => category.id !== (record as AdminCategory)?.id)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </label>

          <FormInputField
            type="number"
            label="Порядок сортировки"
            value={String(values.sortOrder ?? '')}
            onChange={(event) => updateValue('sortOrder', event.target.value)}
          />

          <FormInputField
            label="URL изображения"
            value={String(values.imageUrl ?? '')}
            onChange={(event) => updateValue('imageUrl', event.target.value)}
          />

          <FormInputField
            label="Alt изображения"
            value={String(values.imageAlt ?? '')}
            onChange={(event) => updateValue('imageAlt', event.target.value)}
          />

          <div className="md:col-span-2">
            <FormTextareaField
              label="Описание"
              value={String(values.description ?? '')}
              onChange={(event) =>
                updateValue('description', event.target.value)
              }
            />
          </div>
        </div>
      )}

      {tabId === 'products' && (
        <div className="grid gap-4 md:grid-cols-2">
          <FormInputField
            required
            label="Название"
            value={String(values.title ?? '')}
            onChange={(event) => updateValue('title', event.target.value)}
          />

          <FormInputField
            label="Slug"
            caption="Можно оставить пустым, система создаст сама."
            value={String(values.slug ?? '')}
            onChange={(event) => updateValue('slug', event.target.value)}
          />

          <label className="block space-y-1.5">
            <span className="text-sm font-medium after:ml-1 after:text-destructive after:content-['*']">
              Категория
            </span>

            <select
              required
              value={String(values.categoryId ?? '')}
              className={SELECT_CLASS_NAME}
              onChange={(event) => updateValue('categoryId', event.target.value)}
            >
              <option value="">Выберите категорию</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <FormInputField
            required
            type="number"
            label="Цена"
            value={String(values.price ?? '')}
            onChange={(event) => updateValue('price', event.target.value)}
          />

          <div className="md:col-span-2">
            <FormTextareaField
              label="Описание"
              value={String(values.description ?? '')}
              onChange={(event) =>
                updateValue('description', event.target.value)
              }
            />
          </div>

          <div className="md:col-span-2">
            <FormTextareaField
              label="Изображения"
              caption="Каждый URL с новой строки."
              value={String(values.imageUrls ?? '')}
              onChange={(event) => updateValue('imageUrls', event.target.value)}
            />
          </div>
        </div>
      )}

      {tabId === 'collections' && (
        <div className="grid gap-4 md:grid-cols-2">
          <FormInputField
            required
            label="Название"
            value={String(values.title ?? '')}
            onChange={(event) => updateValue('title', event.target.value)}
          />

          <FormInputField
            label="Slug"
            caption="Например: popular-products."
            value={String(values.slug ?? '')}
            onChange={(event) => updateValue('slug', event.target.value)}
          />

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Тип подборки</span>

            <select
              value={String(values.type ?? 'CATEGORY')}
              className={SELECT_CLASS_NAME}
              onChange={(event) => updateValue('type', event.target.value)}
            >
              <option value="CATEGORY">Категории</option>
              <option value="PRODUCT">Продукты</option>
            </select>
          </label>

          <div className="md:col-span-2">
            <FormTextareaField
              label="Описание"
              value={String(values.description ?? '')}
              onChange={(event) =>
                updateValue('description', event.target.value)
              }
            />
          </div>
        </div>
      )}

      {tabId === 'orders' && (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Статус заказа</span>

          <select
            value={String(values.status ?? 'CREATED')}
            className={SELECT_CLASS_NAME}
            onChange={(event) => updateValue('status', event.target.value)}
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      )}

      {tabId !== 'orders' && (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(values.isActive)}
            onChange={(event) => updateValue('isActive', event.target.checked)}
          />
          Активно
        </label>
      )}

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Сохраняем...' : 'Сохранить'}
        </Button>
      </div>
    </form>
  );
}