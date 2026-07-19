import type { ReactNode } from 'react';

import type { AdminUser } from '@/entities/admin';
import { USER_ROLE_LABELS } from '@/entities/user';
import { Avatar } from '@/shared/ui/Avatar';

import { AdminRecordsList } from '../../../AdminRecordsList';
import { AdminRecordsTable } from '../../../AdminRecordsTable';
import type { AdminBulkAction } from '../../../AdminRecordsTable/types/admin-records-table';
import { renderHighlightedText } from '../../../../logic/render-highlighted-text';
import type { AdminViewMode } from '../../../../types/admin-management';

type AdminUserRecordsViewProps = {
  users: AdminUser[];
  viewMode: AdminViewMode;
  searchValue: string;
  renderActions: (user: AdminUser) => ReactNode;
  bulkActions?: AdminBulkAction[];
};

function getUserName(user: AdminUser) {
  return user.nickname || user.email;
}

function getFullName(user: AdminUser) {
  const parts = [user.lastName, user.firstName, user.patronymic].filter(
    Boolean,
  );

  return parts.join(' ') || '—';
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
  bulkActions,
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
      bulkActions={bulkActions}
      columns={[
        {
          key: 'avatar',
          title: 'Фото',
          width: 72,
          sortable: false,
          getValue: (user) => (user.avatar ? user.avatar.url : ''),
          render: (user) => (
            <Avatar
              src={user.avatar?.url}
              name={getUserName(user)}
              size="sm"
            />
          ),
        },
        {
          key: 'id',
          title: 'ID',
          width: 100,
          sortable: false,
          getValue: (user) => user.id,
          render: (user) => (
            <code className="truncate rounded bg-muted px-1 py-0.5 text-xs font-mono">
              {user.id.slice(0, 8)}
            </code>
          ),
        },
        {
          key: 'nickname',
          title: 'Имя аккаунта',
          width: 180,
          sortable: true,
          filter: { type: 'text', placeholder: 'Имя аккаунта' },
          getValue: (user) => getUserName(user),
          render: (user) =>
            renderHighlightedText(getUserName(user), searchValue),
        },
        {
          key: 'fullName',
          title: 'ФИО',
          width: 180,
          sortable: true,
          filter: { type: 'text', placeholder: 'ФИО' },
          getValue: (user) => getFullName(user),
          render: (user) => renderHighlightedText(getFullName(user), searchValue),
        },
        {
          key: 'nicknameSuffix',
          title: 'Суффикс',
          width: 120,
          sortable: true,
          filter: { type: 'text', placeholder: 'Суффикс' },
          getValue: (user) => user.nicknameSuffix,
          render: (user) =>
            <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
              {user.nicknameSuffix.slice(0, 8)}
            </code>,
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
