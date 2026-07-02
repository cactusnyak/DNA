import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

type DeletedAwareRecord = {
  deletedAt?: string | Date | null;
};

type AdminTableColumn<TRecord> = {
  key: string;
  title: ReactNode;
  render: (record: TRecord) => ReactNode;
};

type AdminRecordsTableProps<TRecord extends DeletedAwareRecord> = {
  records: TRecord[];
  columns: AdminTableColumn<TRecord>[];
  getRecordKey: (record: TRecord) => string;
  renderActions?: (record: TRecord) => ReactNode;
  emptyText: ReactNode;
};

export function AdminRecordsTable<TRecord extends DeletedAwareRecord>({
  records,
  columns,
  getRecordKey,
  renderActions,
  emptyText,
}: AdminRecordsTableProps<TRecord>) {
  if (!records.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium">
                  {column.title}
                </th>
              ))}

              {renderActions && (
                <th className="px-4 py-3 text-right font-medium">
                  Действия
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {records.map((record) => {
              const isDeleted = Boolean(record.deletedAt);

              return (
                <tr
                  key={getRecordKey(record)}
                  className={cn(
                    'align-top transition-colors',
                    isDeleted && 'bg-muted/30 text-muted-foreground',
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 py-3',
                        isDeleted && 'opacity-65',
                      )}
                    >
                      {column.render(record)}
                    </td>
                  ))}

                  {renderActions && (
                    <td className="px-4 py-3 text-right">
                      {renderActions(record)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}