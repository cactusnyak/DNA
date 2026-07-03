import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { cn } from '@/shared/utils/cn';

import { getAdminTableAlignClassName } from './logic/get-admin-table-align-class-name';
import { getAdminTableFilterConfig } from './logic/get-admin-table-filter-config';
import { getAdminTableRangeFilterValue } from './logic/get-admin-table-range-filter-value';
import { getDefaultColumnWidth } from './logic/get-default-column-width';
import { useAdminRecordsTableState } from './logic/use-admin-records-table-state';
import type {
  AdminRecordsTableProps,
  AdminTableColumn,
  AdminTableSortState,
  DeletedAwareRecord,
} from './types/admin-records-table';

function renderSortIcon<TRecord>(
  column: AdminTableColumn<TRecord>,
  sortState: AdminTableSortState,
) {
  if (!column.sortable) {
    return null;
  }

  if (sortState?.key !== column.key) {
    return <ArrowUpDown className="size-3.5 opacity-45" strokeWidth={1.5} />;
  }

  return sortState.direction === 'asc' ? (
    <ArrowUp className="size-3.5" strokeWidth={1.5} />
  ) : (
    <ArrowDown className="size-3.5" strokeWidth={1.5} />
  );
}

export function AdminRecordsTable<TRecord extends DeletedAwareRecord>({
  records,
  columns,
  getRecordKey,
  renderActions,
  emptyText,
}: AdminRecordsTableProps<TRecord>) {
  const {
    sortState,
    filterValues,
    filterableColumns,
    visibleRecords,
    hasActiveFilters,
    resizingColumnKey,
    columnWidths,
    tableMinWidth,
    updateFilterValue,
    updateRangeFilterValue,
    resetFilters,
    handleSortClick,
    handleColumnResizeStart,
  } = useAdminRecordsTableState({
    records,
    columns,
    hasActions: Boolean(renderActions),
  });

  if (!records.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      {filterableColumns.length > 0 && (
        <div className="border-b border-border bg-muted/20 p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Фильтры таблицы</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Показано {visibleRecords.length} из {records.length} записей.
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                  onClick={resetFilters}
                >
                  <RotateCcw className="size-3.5" strokeWidth={1.5} />
                  Сбросить
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {filterableColumns.map((column) => {
                const filterConfig = getAdminTableFilterConfig(column);

                if (!filterConfig) {
                  return null;
                }

                const label = filterConfig.label ?? column.title;
                const filterValue = filterValues[column.key];

                if (filterConfig.type === 'select') {
                  return (
                    <div key={column.key} className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        {label}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          className={cn(
                            'cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                            !filterValue
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border text-muted-foreground hover:bg-background hover:text-foreground',
                          )}
                          onClick={() => updateFilterValue(column.key, '')}
                        >
                          Все
                        </button>

                        {filterConfig.options?.map((option) => {
                          const isActive = filterValue === option.value;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              className={cn(
                                'cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                                isActive
                                  ? 'border-foreground bg-foreground text-background'
                                  : 'border-border text-muted-foreground hover:bg-background hover:text-foreground',
                              )}
                              onClick={() =>
                                updateFilterValue(column.key, option.value)
                              }
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (filterConfig.type === 'numberRange') {
                  const rangeValue = getAdminTableRangeFilterValue(filterValue);

                  return (
                    <div key={column.key} className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        {label}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          value={rangeValue.from ?? ''}
                          placeholder="От"
                          className="h-9"
                          onChange={(event) =>
                            updateRangeFilterValue(
                              column.key,
                              'from',
                              event.target.value,
                            )
                          }
                        />

                        <Input
                          type="number"
                          value={rangeValue.to ?? ''}
                          placeholder="До"
                          className="h-9"
                          onChange={(event) =>
                            updateRangeFilterValue(
                              column.key,
                              'to',
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={column.key} className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      {label}
                    </div>

                    <Input
                      value={typeof filterValue === 'string' ? filterValue : ''}
                      placeholder={filterConfig.placeholder ?? 'Поиск'}
                      className="h-9"
                      onChange={(event) =>
                        updateFilterValue(column.key, event.target.value)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table
          className="w-full table-fixed text-left text-sm"
          style={{ minWidth: `${Math.max(tableMinWidth, 760)}px` }}
        >
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((column) => {
                const width =
                  columnWidths[column.key] ?? getDefaultColumnWidth(column);
                const isResizing = resizingColumnKey === column.key;

                return (
                  <th
                    key={column.key}
                    className={cn(
                      'group relative border-r border-border/60 px-4 py-3 font-medium last:border-r-0',
                      getAdminTableAlignClassName(column.align),
                    )}
                    style={{ width: `${width}px` }}
                  >
                    <button
                      type="button"
                      disabled={!column.sortable}
                      className={cn(
                        'inline-flex max-w-full items-center gap-2 text-current',
                        column.sortable
                          ? 'cursor-pointer hover:text-foreground'
                          : 'cursor-default',
                      )}
                      onClick={() => handleSortClick(column)}
                    >
                      <span className="truncate">{column.title}</span>
                      {renderSortIcon(column, sortState)}
                    </button>

                    <span
                      role="separator"
                      aria-orientation="vertical"
                      className="absolute right-0 top-0 flex h-full w-3 cursor-col-resize items-center justify-center"
                      onPointerDown={(event) =>
                        handleColumnResizeStart(event, column)
                      }
                    >
                      <span
                        className={cn(
                          'h-6 w-0.5 rounded-full bg-muted-foreground/45 opacity-0 transition-opacity',
                          'group-hover:opacity-100',
                          isResizing && 'opacity-100',
                        )}
                      />
                    </span>
                  </th>
                );
              })}

              {renderActions && (
                <th className="w-[180px] px-4 py-3 text-right font-medium">
                  Действия
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {visibleRecords.length ? (
              visibleRecords.map((record) => {
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
                          getAdminTableAlignClassName(column.align),
                          isDeleted && 'opacity-60',
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
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  Записи не найдены по выбранным фильтрам.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
