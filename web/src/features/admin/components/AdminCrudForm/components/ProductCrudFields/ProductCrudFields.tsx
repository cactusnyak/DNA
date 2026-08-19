import {
  FormImageFilesField,
  FormInputField,
  FormSelectField,
  FormTextareaField,
  FormToggleField,
} from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import type { AdminProductPackage } from '@/entities/admin';

import type { AdminCrudFieldsProps } from '../../types/admin-crud-form';
import type { ProductAddition } from '@/entities/product';
import { ProductAdditionsFields } from '../ProductAdditionsFields';
import { LocationCrudFields } from '../LocationCrudFields';

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function getFileArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is File => item instanceof File)
    : [];
}

export function ProductCrudFields({
  values,
  categories,
  warehouses = [],
  deliveryProviders = [],
  onValueChange,
}: AdminCrudFieldsProps) {
  const categoryOptions = [
    {
      value: '',
      label: 'Выберите категорию',
      disabled: true,
    },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  const existingImageUrls = getStringArray(values.imageUrls);
  const imageFiles = getFileArray(values.imageFiles);
  const packages = Array.isArray(values.packages) ? values.packages as AdminProductPackage[] : [];
  const warehouseIds = getStringArray(values.warehouseIds);
  const serviceIds = getStringArray(values.deliveryServiceIds);
  const updatePackage = (index: number, patch: Partial<AdminProductPackage>) => onValueChange('packages', packages.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));

  return (
    <div className="flex flex-col gap-5">
      <FormInputField
        name="title"
        required
        label="Название"
        value={String(values.title ?? '')}
        onChange={(event) => onValueChange('title', event.target.value)}
      />

      <section className="space-y-5 rounded-2xl border border-border/80 p-5">
        <div><h4 className="font-medium">Логистика</h4><p className="text-sm text-muted-foreground">Канонические единицы: граммы и миллиметры. Сервисы доступны только при настроенных упаковках и основном складе.</p></div>
        <div className="space-y-4"><FormInputField name="sku" label="SKU" value={String(values.sku ?? '')} onChange={(event) => onValueChange('sku', event.target.value)} /><FormInputField name="purchasePrice" type="number" min={0} label="Закупочная стоимость, ₽" value={String(values.purchasePrice ?? '')} onChange={(event) => onValueChange('purchasePrice', event.target.value)} /></div>
        <FormToggleField label="Использовать профиль перевозки" checked={Boolean(values.shippingProfileEnabled)} onCheckedChange={(value) => onValueChange('shippingProfileEnabled', value)} />
        {Boolean(values.shippingProfileEnabled) && <div className="space-y-3"><FormToggleField label="Хрупкий" checked={Boolean(values.isFragile)} onCheckedChange={(value) => onValueChange('isFragile', value)} /><FormToggleField label="Штабелируемый" checked={Boolean(values.isStackable)} onCheckedChange={(value) => onValueChange('isStackable', value)} /><FormToggleField label="18+" checked={Boolean(values.ageRestricted)} onCheckedChange={(value) => onValueChange('ageRestricted', value)} /><FormTextareaField name="handlingNotes" label="Инструкции по обращению" value={String(values.handlingNotes ?? '')} onChange={(event) => onValueChange('handlingNotes', event.target.value)} /></div>}
        <div className="space-y-3"><div className="flex items-center justify-between"><h5 className="text-sm font-medium">Упаковки одной единицы товара</h5><Button type="button" size="sm" variant="secondary" onClick={() => onValueChange('packages', [...packages, { sequence: packages.length, type: 'BOX', quantity: 1, weightGrams: 1, lengthMillimeters: 1, widthMillimeters: 1, heightMillimeters: 1 }])}>Добавить упаковку</Button></div>{packages.map((item, index) => <div key={item.id ?? index} className="space-y-3 rounded-xl bg-muted/30 p-4"><FormInputField name={`package-name-${index}`} label="Название" value={item.name ?? ''} onChange={(event) => updatePackage(index, { name: event.target.value })} /><FormSelectField label="Тип" value={item.type} options={['BOX','PALLET','ENVELOPE','CRATE','OTHER'].map((value) => ({ value, label: value }))} onValueChange={(value) => updatePackage(index, { type: value as AdminProductPackage['type'] })} /><FormInputField required min={1} type="number" name={`package-quantity-${index}`} label="Количество мест" value={String(item.quantity)} onChange={(event) => updatePackage(index, { quantity: Number(event.target.value) })} /><FormInputField required min={1} type="number" name={`package-weight-${index}`} label="Вес, г" value={String(item.weightGrams)} onChange={(event) => updatePackage(index, { weightGrams: Number(event.target.value) })} /><FormInputField required min={1} type="number" name={`package-length-${index}`} label="Длина, мм" value={String(item.lengthMillimeters)} onChange={(event) => updatePackage(index, { lengthMillimeters: Number(event.target.value) })} /><FormInputField required min={1} type="number" name={`package-width-${index}`} label="Ширина, мм" value={String(item.widthMillimeters)} onChange={(event) => updatePackage(index, { widthMillimeters: Number(event.target.value) })} /><FormInputField required min={1} type="number" name={`package-height-${index}`} label="Высота, мм" value={String(item.heightMillimeters)} onChange={(event) => updatePackage(index, { heightMillimeters: Number(event.target.value) })} /><Button type="button" variant="destructive" size="sm" onClick={() => onValueChange('packages', packages.filter((_, itemIndex) => itemIndex !== index).map((value, sequence) => ({ ...value, sequence })))}>Удалить</Button></div>)}</div>
        <div className="space-y-3"><h5 className="text-sm font-medium">Склады</h5>{warehouses.map((warehouse) => { const selected = warehouseIds.includes(warehouse.id); return <div key={warehouse.id} className="space-y-3 rounded-xl border p-3"><div>{warehouse.name}<div className="text-xs text-muted-foreground">{warehouse.code} · {warehouse.isConfigured ? 'настроен' : 'не настроен'}{!warehouse.isActive ? ' · неактивен' : ''}</div></div><FormToggleField label="Использовать" checked={selected} disabled={!warehouse.isActive && !selected} onCheckedChange={(checked) => onValueChange('warehouseIds', checked ? [...warehouseIds, warehouse.id] : warehouseIds.filter((id) => id !== warehouse.id))} /><FormToggleField label="Основной" checked={values.primaryWarehouseId === warehouse.id} disabled={!selected || !warehouse.isActive} onCheckedChange={(checked) => onValueChange('primaryWarehouseId', checked ? warehouse.id : '')} /></div>; })}</div>
        <div className="space-y-3"><h5 className="text-sm font-medium">Доступные сервисы</h5>{deliveryProviders.map((provider) => { const selectable = provider.services.filter((service) => service.isActive || serviceIds.includes(service.id)); const selectedCount = selectable.filter((service) => serviceIds.includes(service.id)).length; return <div key={provider.id} className="rounded-xl border p-3"><FormToggleField label={`${provider.name} (${selectedCount}/${selectable.length})`} checked={selectable.length > 0 && selectedCount === selectable.length} disabled={!provider.isActive} onCheckedChange={(checked) => onValueChange('deliveryServiceIds', checked ? Array.from(new Set([...serviceIds, ...selectable.filter((service) => service.isActive).map((service) => service.id)])) : serviceIds.filter((id) => !selectable.some((service) => service.id === id)))} /> <div className="mt-2 space-y-2">{selectable.map((service) => <FormToggleField key={service.id} label={`${service.name} · ${service.kind}`} checked={serviceIds.includes(service.id)} disabled={!service.isActive || !provider.isActive} onCheckedChange={(checked) => onValueChange('deliveryServiceIds', checked ? [...serviceIds, service.id] : serviceIds.filter((id) => id !== service.id))} />)}</div></div>; })}</div>
      </section>

      <FormInputField
        name="slug"
        label="Slug"
        caption="Можно оставить пустым, система создаст сама."
        value={String(values.slug ?? '')}
        onChange={(event) => onValueChange('slug', event.target.value)}
      />

      <FormSelectField
        required
        label="Категория"
        value={String(values.categoryId ?? '')}
        options={categoryOptions}
        onValueChange={(value) => onValueChange('categoryId', value)}
      />

      <FormSelectField label="Крупногабаритность" caption={`При наследовании сейчас: ${categories.find((category) => category.id === values.categoryId)?.isOversized ? 'крупногабаритный' : 'обычный товар'}`} value={String(values.isOversizedOverride ?? 'inherit')} options={[{ value: 'inherit', label: 'Наследовать от категории' }, { value: 'oversized', label: 'Крупногабаритный' }, { value: 'regular', label: 'Обычный товар' }]} onValueChange={(value) => onValueChange('isOversizedOverride', value)} />

      <FormInputField
        name="price"
        required
        type="number"
        label="Цена"
        value={String(values.price ?? '')}
        onChange={(event) => onValueChange('price', event.target.value)}
      />

      <FormTextareaField
        name="description"
        label="Описание"
        caption="Каждая строка — отдельный блок. Начните строку с «# », чтобы создать заголовок."
        rows={8}
        value={String(values.description ?? '')}
        onChange={(event) => onValueChange('description', event.target.value)}
      />

      <LocationCrudFields
        plain
        values={values}
        onValueChange={onValueChange}
      />

      <FormImageFilesField
        name="images"
        label="Изображения"
        caption="Новые файлы будут загружены на сервер, а в товар сохранятся полученные URL."
        files={imageFiles}
        existingImageUrls={existingImageUrls}
        onFilesChange={(files) => onValueChange('imageFiles', files)}
        onExistingImageUrlsChange={(imageUrls) =>
          onValueChange('imageUrls', imageUrls)
        }
      />

      <ProductAdditionsFields
        value={
          Array.isArray(values.additions)
            ? (values.additions as ProductAddition[])
            : []
        }
        onChange={(additions) => onValueChange('additions', additions)}
      />
    </div>
  );
}
