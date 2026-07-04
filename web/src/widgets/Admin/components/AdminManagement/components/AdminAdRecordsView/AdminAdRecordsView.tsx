import type { ReactNode } from 'react';

import type { AdminAd } from '@/entities/admin';
import { formatAdStatus } from '@/entities/ad';
import { formatPrice } from '@/shared/utils/format-price';

import { AdminRecordsList } from '../../../AdminRecordsList';
import { AdminRecordsTable } from '../../../AdminRecordsTable';
import { renderHighlightedText } from '../../../../logic/render-highlighted-text';
import type { AdminViewMode } from '../../../../types/admin-management';

type AdminAdRecordsViewProps = {
  ads: AdminAd[];
  viewMode: AdminViewMode;
  searchValue: string;
  renderActions: (ad: AdminAd) => ReactNode;
};

function getStatusFilterOptions(ads: AdminAd[]) {
  const statuses = Array.from(new Set(ads.map((ad) => ad.status)));

  return statuses.map((status) => ({
    value: formatAdStatus(status),
    label: formatAdStatus(status),
  }));
}

function getSellerName(ad: AdminAd) {
  if (!ad.seller) {
    return 'Неизвестный продавец';
  }

  return `${ad.seller.firstName} ${ad.seller.lastName}`.trim();
}

export function AdminAdRecordsView({
  ads,
  viewMode,
  searchValue,
  renderActions,
}: AdminAdRecordsViewProps) {
  if (viewMode === 'list') {
    return (
      <AdminRecordsList
        records={ads}
        getRecordKey={(ad) => ad.id}
        getTitle={(ad) => renderHighlightedText(ad.title, searchValue)}
        getDescription={(ad) =>
          renderHighlightedText(ad.description || 'Без описания', searchValue)
        }
        getMeta={(ad) =>
          `${getSellerName(ad)} · ${formatPrice(ad.price)} · ${formatAdStatus(ad.status)}`
        }
        renderActions={renderActions}
        emptyText="Объявления не найдены."
      />
    );
  }

  return (
    <AdminRecordsTable
      records={ads}
      getRecordKey={(ad) => ad.id}
      emptyText="Объявления не найдены."
      renderActions={renderActions}
      columns={[
        {
          key: 'title',
          title: 'Заголовок',
          width: 260,
          sortable: true,
          filter: { type: 'text', placeholder: 'Заголовок' },
          getValue: (ad) => ad.title,
          render: (ad) => renderHighlightedText(ad.title, searchValue),
        },
        {
          key: 'category',
          title: 'Категория',
          width: 200,
          sortable: true,
          filter: { type: 'text', placeholder: 'Категория' },
          getValue: (ad) => ad.category?.name || 'Без категории',
          render: (ad) =>
            renderHighlightedText(ad.category?.name ?? '', searchValue),
        },
        {
          key: 'seller',
          title: 'Продавец',
          width: 200,
          sortable: true,
          filter: { type: 'text', placeholder: 'Продавец' },
          getValue: (ad) => getSellerName(ad),
          render: (ad) => renderHighlightedText(getSellerName(ad), searchValue),
        },
        {
          key: 'price',
          title: 'Цена',
          width: 140,
          align: 'right',
          sortable: true,
          filter: { type: 'numberRange' },
          getValue: (ad) => ad.price,
          render: (ad) => formatPrice(ad.price),
        },
        {
          key: 'status',
          title: 'Статус',
          width: 170,
          sortable: true,
          filter: {
            type: 'select',
            options: getStatusFilterOptions(ads),
          },
          getValue: (ad) => formatAdStatus(ad.status),
          render: (ad) => formatAdStatus(ad.status),
        },
      ]}
    />
  );
}
