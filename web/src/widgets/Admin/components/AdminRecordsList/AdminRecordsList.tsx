import type { ReactNode } from 'react';

type AdminRecordsListProps<TRecord> = {
  records: TRecord[];
  getRecordKey: (record: TRecord) => string;
  getTitle: (record: TRecord) => ReactNode;
  getDescription?: (record: TRecord) => ReactNode;
  getMeta?: (record: TRecord) => ReactNode;
  renderActions?: (record: TRecord) => ReactNode;
  emptyText: ReactNode;
};

export function AdminRecordsList<TRecord>({
  records,
  getRecordKey,
  getTitle,
  getDescription,
  getMeta,
  renderActions,
  emptyText,
}: AdminRecordsListProps<TRecord>) {
  if (!records.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {records.map((record) => (
        <article
          key={getRecordKey(record)}
          className="rounded-2xl border border-border p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">{getTitle(record)}</h3>

              {getDescription && (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {getDescription(record)}
                </p>
              )}

              {getMeta && (
                <div className="mt-3 text-xs text-muted-foreground">
                  {getMeta(record)}
                </div>
              )}
            </div>

            {renderActions && (
              <div className="flex flex-wrap justify-end gap-2">
                {renderActions(record)}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
