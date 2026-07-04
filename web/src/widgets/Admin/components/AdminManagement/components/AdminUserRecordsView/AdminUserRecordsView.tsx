import type { ReactNode } from 'react';

import type { AdminUser } from '@/entities/admin';
import { USER_ROLE_LABELS } from '@/entities/user';

import { AdminRecordsList } from '../../../AdminRecordsList';
import { AdminRecordsTable } from '../../../AdminRecordsTable';
import { renderHighlightedText } from '../../../../logic/render-highlighted-text';
import type { AdminViewMode } from '../../../../types/admin-management';

type AdminUserRecordsViewProps = {
  users: AdminUser[];
  viewMode: AdminViewMode;
  searchValue: string;
  renderActions: (user: AdminUser) => ReactNode;
};

function getUserName(user: AdminUser) {
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
}

function getRoleFilterOptions(users: AdminUser[]) {
  const roles = Array.from(new Set(users.map((user) => user.role)));

  return roles.map((role) => ({
    value: USER_ROLE_LABELS[role],
    label: USER_ROLE_LABELS[role],
  }));
}

export function AdminUserRecordsView({
  users,
  viewMode,
  searchValue,
  renderActions,
}: AdminUserRecordsViewProps) {
  if (viewMode === 'list') {
    return (
      <AdminRecordsList
        records={users}
        getRecordKey={(user) => user.id}
        getTitle={(user) => renderHighlightedText(getUserName(user), searchValue)}
        getDescription={(user) =>
          renderHighlightedText(user.email, searchValue)
        }
        getMeta={(user) =>
          `${USER_ROLE_LABELS[user.role]} · объявлений: ${user.adsCount} · заказов: ${user.ordersCount}${
            user.isActive ? '' : ' · удалён'
          }`
        }
        renderActions={renderActions}
        emptyText="Пользователи не найдены."
      />
    );
  }

  return (
    <AdminRecordsTable
      records={users}
      getRecordKey={(user) => user.id}
      emptyText="Пользователи не найдены."
      renderActions={renderActions}
      columns={[
        {
          key: 'name',
          title: 'Имя',
          width: 220,
          sortable: true,
          filter: { type: 'text', placeholder: 'Имя' },
          getValue: (user) => getUserName(user),
          render: (user) =>
            renderHighlightedText(getUserName(user), searchValue),
        },
        {
          key: 'email',
          title: 'Email',
          width: 240,
          sortable: true,
          filter: { type: 'text', placeholder: 'Email' },
          getValue: (user) => user.email,
          render: (user) => renderHighlightedText(user.email, searchValue),
        },
        {
          key: 'role',
          title: 'Роль',
          width: 190,
          sortable: true,
          filter: {
            type: 'select',
            options: getRoleFilterOptions(users),
          },
          getValue: (user) => USER_ROLE_LABELS[user.role],
          render: (user) => USER_ROLE_LABELS[user.role],
        },
        {
          key: 'ads',
          title: 'Объявлений',
          width: 140,
          align: 'right',
          sortable: true,
          filter: { type: 'numberRange' },
          getValue: (user) => user.adsCount,
          render: (user) => user.adsCount,
        },
        {
          key: 'status',
          title: 'Статус',
          width: 150,
          sortable: true,
          filter: {
            type: 'select',
            options: [
              { value: 'Активен', label: 'Активен' },
              { value: 'Удалён', label: 'Удалён' },
            ],
          },
          getValue: (user) => (user.isActive ? 'Активен' : 'Удалён'),
          render: (user) => (user.isActive ? 'Активен' : 'Удалён'),
        },
      ]}
    />
  );
}
