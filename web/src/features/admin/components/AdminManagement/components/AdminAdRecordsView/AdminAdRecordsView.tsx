import type { ReactNode } from 'react';

import type { AdminAd } from '@/entities/admin';
import { AdminShortId } from '@/features/admin/components/AdminShortId';
import { formatAdStatus } from '@/entities/ad';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatPrice } from '@/shared/utils/format-price';
import { formatLocationCoordinates } from '@/shared/utils/format-location-coordinates';
import { contentDescriptionToPlainText } from '@/shared/utils/content-description';

import { AdminRecordsList } from '../../../AdminRecordsList';
import { AdminRecordsTable } from '../../../AdminRecordsTable';
import { AdminTableImage } from '../../../AdminTableImage';
import type { AdminBulkAction } from '../../../AdminRecordsTable/types/admin-records-table';
import { renderHighlightedText } from '../../../../logic/render-highlighted-text';
import { getAdStatusVariant } from '../../../../logic/get-admin-status-variant';
import type { AdminViewMode } from '../../../../types/admin-management';

type AdminAdRecordsViewProps = {
  ads: AdminAd[];
  viewMode: AdminViewMode;
  searchValue: string;
  renderActions: (ad: AdminAd) => ReactNode;
  bulkActions?: AdminBulkAction[];
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

  return ad.seller.nickname;
}

export function AdminAdRecordsView({
  ads,
  viewMode,
  searchValue,
  renderActions,
  bulkActions,
}: AdminAdRecordsViewProps) {
  if (viewMode === 'list') {
    return (
      <AdminRecordsList
        records={ads}
        getRecordKey={(ad) => ad.id}
        getTitle={(ad) => renderHighlightedText(ad.title, searchValue)}
        getDescription={(ad) =>
          renderHighlightedText(
            contentDescriptionToPlainText(ad.description) || 'Без описания',
            searchValue,
          )
        }
        getMeta={(ad) =>
          `${getSellerName(ad)} · ${formatPrice(ad.price)} · ${ad.location?.name ?? 'Без геопозиции'} · ${formatAdStatus(ad.status)}`
        }
        renderActions={renderActions}
        emptyText="Объявления не найдены."
      />
    );
  }

  return (
    <AdminRecordsTable
      tableKey="ads"
      records={ads}
      getRecordKey={(ad) => ad.id}
      emptyText="Объявления не найдены."
      renderActions={renderActions}
      bulkActions={bulkActions}
      columns={[
        {
          key: 'image',
          title: 'Фото',
          width: 72,
          sortable: false,
          getValue: (ad) => ad.images[0]?.url ?? '',
          render: (ad) => (
            <AdminTableImage
              src={ad.images[0]?.url}
              alt={ad.images[0]?.alt ?? ad.title}
            />
          ),
        },
        {
          key: 'id',
          title: 'ID',
          width: 100,
          sortable: false,
          getValue: (ad) => ad.id,
          render: (ad) => (
            <AdminShortId value={ad.id} />
          ),
        },
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
          key: 'contactPhone',
          title: 'Телефон',
          width: 160,
          sortable: false,
          filter: { type: 'text', placeholder: 'Телефон' },
          getValue: (ad) => ad.contactPhone ?? '',
          render: (ad) =>
            ad.contactPhone ? (
              <a
                href={`tel:${ad.contactPhone}`}
                className="underline underline-offset-2"
              >
                {renderHighlightedText(ad.contactPhone, searchValue)}
              </a>
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        {
          key: 'contactTelegram',
          title: 'Telegram',
          width: 150,
          sortable: false,
          filter: { type: 'text', placeholder: 'Telegram' },
          getValue: (ad) => ad.contactTelegram ?? '',
          render: (ad) =>
            ad.contactTelegram ? (
              <a
                href={`https://t.me/${ad.contactTelegram.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                {renderHighlightedText(ad.contactTelegram, searchValue)}
              </a>
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        {
          key: 'contactEmail',
          title: 'Email (объявл.)',
          width: 200,
          sortable: false,
          filter: { type: 'text', placeholder: 'Email' },
          getValue: (ad) => ad.contactEmail ?? '',
          render: (ad) =>
            ad.contactEmail ? (
              <a
                href={`mailto:${ad.contactEmail}`}
                className="underline underline-offset-2"
              >
                {renderHighlightedText(ad.contactEmail, searchValue)}
              </a>
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        {
          key: 'contactOther',
          title: 'Другой контакт',
          width: 180,
          sortable: false,
          filter: { type: 'text', placeholder: 'Другой контакт' },
          getValue: (ad) => ad.contactOther ?? '',
          render: (ad) =>
            ad.contactOther ? (
              renderHighlightedText(ad.contactOther, searchValue)
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        {
          key: 'locationName',
          title: 'Геопозиция',
          width: 180,
          sortable: true,
          filter: { type: 'text', placeholder: 'Название точки' },
          getValue: (ad) => ad.location?.name ?? '',
          render: (ad) =>
            ad.location?.name ? (
              renderHighlightedText(ad.location.name, searchValue)
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        {
          key: 'locationCoordinates',
          title: 'Координаты',
          width: 200,
          sortable: false,
          getValue: (ad) => formatLocationCoordinates(ad.location),
          render: (ad) => formatLocationCoordinates(ad.location),
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
          render: (ad) => <StatusBadge text={formatAdStatus(ad.status)} variant={getAdStatusVariant(ad.status)} />,
        },
      ]}
    />
  );
}
