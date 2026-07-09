import type { ReactNode } from 'react';

import type { AdminReferralUser } from '@/entities/admin';

import { AdminRecordsList } from '../../../AdminRecordsList';
import { AdminRecordsTable } from '../../../AdminRecordsTable';
import { renderHighlightedText } from '../../../../logic/render-highlighted-text';
import type { AdminViewMode } from '../../../../types/admin-management';

type AdminReferralRecordsViewProps = {
  referrals: AdminReferralUser[];
  viewMode: AdminViewMode;
  searchValue: string;
  renderActions: (user: AdminReferralUser) => ReactNode;
};

function getUserName(user: AdminReferralUser) {
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
}


export function AdminReferralRecordsView({
  referrals,
  viewMode,
  searchValue,
  renderActions,
}: AdminReferralRecordsViewProps) {
  if (viewMode === 'list') {
    return (
      <AdminRecordsList
        records={referrals}
        getRecordKey={(user) => user.id}
        getTitle={(user) => renderHighlightedText(getUserName(user), searchValue)}
        getDescription={(user) => renderHighlightedText(user.email, searchValue)}
        getMeta={(user) =>
          `Рефералов: ${user.directReferralsCount}${user.referralCode ? ` · Код: ${user.referralCode}` : ''}${user.invitedBy ? ` · Пригласил: ${user.invitedBy}` : ''}`
        }
        renderActions={renderActions}
        emptyText="Рефералы не найдены."
      />
    );
  }

  return (
    <AdminRecordsTable
      records={referrals}
      getRecordKey={(user) => user.id}
      emptyText="Рефералы не найдены."
      disableSelection
      getSubRows={(user) => user.directReferrals}
      columns={[
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
          key: 'name',
          title: 'Имя',
          width: 200,
          sortable: true,
          filter: { type: 'text', placeholder: 'Имя' },
          getValue: (user) => getUserName(user),
          render: (user) =>
            renderHighlightedText(getUserName(user), searchValue),
        },
        {
          key: 'email',
          title: 'Email',
          width: 220,
          sortable: true,
          filter: { type: 'text', placeholder: 'Email' },
          getValue: (user) => user.email,
          render: (user) => renderHighlightedText(user.email, searchValue),
        },
        {
          key: 'referralCode',
          title: 'Реф. код',
          width: 140,
          sortable: true,
          filter: { type: 'text', placeholder: 'Код' },
          getValue: (user) => user.referralCode ?? '',
          render: (user) =>
            user.referralCode ? (
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                {user.referralCode}
              </code>
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        {
          key: 'invitedBy',
          title: 'Цепочка приглашений',
          width: 240,
          sortable: true,
          filter: { type: 'text', placeholder: 'Цепочка' },
          getValue: (user) => user.invitedBy ?? '',
          render: (user) =>
            user.invitedBy ? (
              <span className="font-mono text-xs text-muted-foreground">
                {user.invitedBy}
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        {
          key: 'directReferralsCount',
          title: 'Рефералов',
          width: 120,
          align: 'right',
          sortable: true,
          filter: { type: 'numberRange' },
          getValue: (user) => user.directReferralsCount,
          render: (user) => user.directReferralsCount,
        },
        {
          key: 'createdAt',
          title: 'Дата регистрации',
          width: 160,
          sortable: true,
          getValue: (user) => user.createdAt,
          render: (user) =>
            new Intl.DateTimeFormat('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(new Date(user.createdAt)),
        },
      ]}
    />
  );
}
