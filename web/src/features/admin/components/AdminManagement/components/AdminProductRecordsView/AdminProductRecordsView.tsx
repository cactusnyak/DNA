import { type ReactNode, useState } from 'react';
import { CircleHelp } from 'lucide-react';

import type { AdminProduct } from '@/entities/admin';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KeyValueTable } from '@/components/ui/KeyValueTable';
import { Modal } from '@/components/ui/Modal';
import { AdminShortId } from '@/features/admin/components/AdminShortId';
import { formatPrice } from '@/shared/utils/format-price';
import { formatLocationCoordinates } from '@/shared/utils/format-location-coordinates';
import { contentDescriptionToPlainText } from '@/shared/utils/content-description';

import { AdminRecordsList } from '../../../AdminRecordsList';
import { AdminRecordsTable } from '../../../AdminRecordsTable';
import { AdminTableImage } from '../../../AdminTableImage';
import type { AdminBulkAction } from '../../../AdminRecordsTable/types/admin-records-table';
import { getAdminRecordStatusLabel } from '../../../../logic/get-admin-record-status-label';
import { getAdminRecordStatusVariant } from '../../../../logic/get-admin-status-variant';
import { renderHighlightedText } from '../../../../logic/render-highlighted-text';
import type { AdminViewMode } from '../../../../types/admin-management';

type AdminProductRecordsViewProps = {
  products: AdminProduct[];
  viewMode: AdminViewMode;
  searchValue: string;
  renderActions: (product: AdminProduct) => ReactNode;
  bulkActions?: AdminBulkAction[];
};

const statusFilterOptions = [
  {
    value: 'Активно',
    label: 'Активно',
  },
  {
    value: 'Неактивно',
    label: 'Неактивно',
  },
  {
    value: 'Удалено',
    label: 'Удалено',
  },
];

function getProductOversizedLabel(product: AdminProduct) {
  if (product.isOversizedOverride === true) return 'Крупногабаритный';
  if (product.isOversizedOverride === false) return 'Обычный товар';
  return `Наследовать от категории (${product.isOversized ? 'Да' : 'Нет'})`;
}

const oversizedFilterOptions = [
  { value: 'Крупногабаритный', label: 'Крупногабаритный' },
  { value: 'Обычный товар', label: 'Обычный товар' },
  { value: 'Наследовать от категории (Да)', label: 'Наследуется: Да' },
  { value: 'Наследовать от категории (Нет)', label: 'Наследуется: Нет' },
];

function getCategoryFilterOptions(products: AdminProduct[]) {
  const optionsByValue = new Map<string, string>();

  products.forEach((product) => {
    const value = product.category?.name || 'Без категории';
    optionsByValue.set(value, value);
  });

  return Array.from(optionsByValue.entries())
    .map(([value, label]) => ({
      value,
      label,
    }))
    .sort((firstOption, secondOption) =>
      firstOption.label.localeCompare(secondOption.label),
    );
}

function getLogisticsReadinessLabel(product: AdminProduct) {
  return product.logisticsReadiness === 'READY'
    ? 'Готова'
    : product.logisticsReadiness === 'PARTIAL'
      ? 'Частично'
      : 'Не настроен';
}

function LogisticsReadinessDetails({ product }: { product: AdminProduct }) {
  const packages = product.shippingProfile?.packages ?? [];
  const packagesValid =
    packages.length > 0 &&
    packages.every((item) =>
      [
        item.quantity,
        item.weightGrams,
        item.lengthMillimeters,
        item.widthMillimeters,
        item.heightMillimeters,
      ].every((value) => value > 0),
    );
  const primaryWarehouse = product.warehouses.find(
    (item) => item.isPrimary && item.isActive,
  );
  const warehouseReady = Boolean(
    primaryWarehouse?.warehouse.isActive &&
    primaryWarehouse.warehouse.isConfigured,
  );
  const activeServices = product.deliveryServices.filter(
    (item) =>
      item.isEnabled &&
      item.deliveryService.isActive &&
      item.deliveryService.provider.isActive,
  );
  const serviceNames = activeServices.map(
    ({ deliveryService }) =>
      `${deliveryService.provider.name}: ${deliveryService.name}`,
  );
  const readinessLabel = getLogisticsReadinessLabel(product);
  const readinessVariant =
    product.logisticsReadiness === 'READY'
      ? 'access'
      : product.logisticsReadiness === 'PARTIAL'
        ? 'warning'
        : 'muted';

  return (
    <KeyValueTable
      rows={[
        {
          key: 'status',
          label: 'Статус',
          value: (
            <StatusBadge text={readinessLabel} variant={readinessVariant} />
          ),
        },
        {
          key: 'profile',
          label: 'Профиль',
          value: (
            <StatusBadge
              text={product.shippingProfile ? 'Настроен' : 'Не настроен'}
              variant={product.shippingProfile ? 'access' : 'warning'}
            />
          ),
        },
        {
          key: 'packages',
          label: 'Упаковки',
          value: packages.length ? (
            <div>
              <span>{packages.length}</span>,{' '}
              <StatusBadge
                text={packagesValid ? 'Параметры заполнены' : 'Есть ошибки'}
                variant={packagesValid ? 'access' : 'destructive'}
              />
            </div>
          ) : (
            <StatusBadge text="Не заданы" variant="warning" />
          ),
        },
        {
          key: 'warehouse',
          label: 'Склад',
          value: primaryWarehouse ? (
            <div>
              <span>{primaryWarehouse.warehouse.name}</span>
              ,{' '}
              <StatusBadge
                text={warehouseReady ? 'Готов' : 'Не настроен'}
                variant={warehouseReady ? 'access' : 'warning'}
              />
            </div>
          ) : (
            <StatusBadge text="Основной склад не выбран" variant="warning" />
          ),
        },
        {
          key: 'services',
          label: 'Сервисы',
          value: serviceNames.length ? (
            <div className="flex flex-wrap gap-1" title={serviceNames.join('\n')}>
              {serviceNames.map((name) => (
                <StatusBadge key={name} text={name} variant="access" />
              ))}
            </div>
          ) : (
            <StatusBadge text="Нет активных" variant="warning" />
          ),
        },
      ]}
    />
  );
}

function LogisticsReadinessCell({ product }: { product: AdminProduct }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const readinessLabel = getLogisticsReadinessLabel(product);
  const readinessVariant =
    product.logisticsReadiness === 'READY'
      ? 'access'
      : product.logisticsReadiness === 'PARTIAL'
        ? 'warning'
        : 'muted';

  return (
    <>
      <div className="flex items-center gap-1">
        <StatusBadge text={readinessLabel} variant={readinessVariant} />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Подробнее о логистике товара «${product.title}»`}
          title="Подробнее о логистике"
          onClick={(event) => {
            event.stopPropagation();
            setIsDetailsOpen(true);
          }}
        >
          <CircleHelp />
        </Button>
      </div>
      <Modal
        isOpen={isDetailsOpen}
        title={`Логистика: ${product.title}`}
        size="sm"
        className="h-auto"
        onClose={() => setIsDetailsOpen(false)}
      >
        <div className="overflow-y-auto p-5">
          <LogisticsReadinessDetails product={product} />
        </div>
      </Modal>
    </>
  );
}

export function AdminProductRecordsView({
  products,
  viewMode,
  searchValue,
  renderActions,
  bulkActions,
}: AdminProductRecordsViewProps) {
  if (viewMode === 'list') {
    return (
      <AdminRecordsList
        records={products}
        getRecordKey={(product) => product.id}
        getTitle={(product) =>
          renderHighlightedText(product.title, searchValue)
        }
        getDescription={(product) =>
          renderHighlightedText(
            contentDescriptionToPlainText(product.description) || 'Без описания',
            searchValue,
          )
        }
        getMeta={(product) =>
          `${product.category?.name ?? 'Без категории'} · ${formatPrice(product.price)} · ${getProductOversizedLabel(product)} · ${product.location?.name ?? 'Без геопозиции'} · ${getAdminRecordStatusLabel(product)}`
        }
        renderActions={renderActions}
        emptyText="Продукты не найдены."
      />
    );
  }

  return (
    <AdminRecordsTable
      tableKey="market-products"
      records={products}
      getRecordKey={(product) => product.id}
      emptyText="Продукты не найдены."
      renderActions={renderActions}
      bulkActions={bulkActions}
      columns={[
        {
          key: 'image',
          title: 'Фото',
          width: 72,
          sortable: false,
          getValue: (product) => product.images[0]?.url ?? '',
          render: (product) => (
            <AdminTableImage
              src={product.images[0]?.url}
              alt={product.images[0]?.alt ?? product.title}
            />
          ),
        },
        {
          key: 'id',
          title: 'ID',
          width: 100,
          sortable: false,
          getValue: (product) => product.id,
          render: (product) => (
            <AdminShortId value={product.id} />
          ),
        },
        {
          key: 'title',
          title: 'Название',
          width: 280,
          sortable: true,
          filter: {
            type: 'text',
            placeholder: 'Название',
          },
          getValue: (product) => product.title,
          render: (product) =>
            renderHighlightedText(product.title, searchValue),
        },
        {
          key: 'category',
          title: 'Категория',
          width: 220,
          sortable: true,
          filter: {
            type: 'select',
            options: getCategoryFilterOptions(products),
          },
          getValue: (product) => product.category?.name || 'Без категории',
          render: (product) =>
            renderHighlightedText(product.category?.name ?? '', searchValue),
        },
        {
          key: 'sku', title: 'SKU', width: 140, sortable: true, filter: { type: 'text' }, getValue: (product) => product.sku ?? '', render: (product) => product.sku ?? '—',
        },
        {
          key: 'purchasePrice', title: 'Закупка', width: 140, align: 'right', sortable: true, getValue: (product) => product.purchasePrice ?? -1, render: (product) => product.purchasePrice == null ? '—' : formatPrice(product.purchasePrice),
        },
        {
          key: 'logisticsReadiness',
          title: 'Логистика',
          width: 150,
          sortable: true,
          filter: {
            type: 'select',
            options: [
              { value: 'Готова', label: 'Готова' },
              { value: 'Частично', label: 'Частично' },
              { value: 'Не настроен', label: 'Не настроен' },
            ],
          },
          getValue: getLogisticsReadinessLabel,
          render: (product) => <LogisticsReadinessCell product={product} />,
        },
        {
          key: 'packages', title: 'Упаковки', width: 120, sortable: true, getValue: (product) => product.shippingProfile?.packages.length ?? 0, render: (product) => product.shippingProfile?.packages.length ?? 0,
        },
        {
          key: 'price',
          title: 'Цена',
          width: 160,
          align: 'right',
          sortable: true,
          filter: {
            type: 'numberRange',
          },
          getValue: (product) => product.price,
          render: (product) => formatPrice(product.price),
        },
        {
          key: 'isOversized',
          title: 'Крупногабаритность',
          width: 250,
          sortable: true,
          filter: { type: 'select', options: oversizedFilterOptions },
          getValue: getProductOversizedLabel,
          render: getProductOversizedLabel,
        },
        {
          key: 'locationName',
          title: 'Геопозиция',
          width: 180,
          sortable: true,
          filter: { type: 'text', placeholder: 'Название точки' },
          getValue: (product) => product.location?.name ?? '',
          render: (product) =>
            product.location?.name ? (
              renderHighlightedText(product.location.name, searchValue)
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        {
          key: 'locationCoordinates',
          title: 'Координаты',
          width: 200,
          sortable: false,
          getValue: (product) => formatLocationCoordinates(product.location),
          render: (product) => formatLocationCoordinates(product.location),
        },
        {
          key: 'additions',
          title: 'Дополнения',
          width: 180,
          sortable: true,
          getValue: (product) => product.additions?.length ?? 0,
          render: (product) =>
            product.additions?.length
              ? `${product.additions.length} дополнений`
              : 'Нет',
        },
        {
          key: 'status',
          title: 'Статус',
          width: 160,
          sortable: true,
          filter: {
            type: 'select',
            options: statusFilterOptions,
          },
          getValue: (product) => getAdminRecordStatusLabel(product),
          render: (product) => <StatusBadge text={getAdminRecordStatusLabel(product)} variant={getAdminRecordStatusVariant(product)} />,
        },
      ]}
    />
  );
}
