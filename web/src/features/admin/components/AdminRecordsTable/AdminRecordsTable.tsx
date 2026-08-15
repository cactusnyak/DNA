import { useState, type ReactNode } from 'react';
import {
  ArchiveX,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Trash2,
  Undo2,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { EmptyPlaceholder } from '@/components/ui/EmptyPlaceholder';
import { FormBooleanField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';

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
  bulkActions,
  getSubRows,
  disableSelection,
}: AdminRecordsTableProps<TRecord>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

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

  const hasBulkActions = Boolean(bulkActions?.length) && !disableSelection;
  const hasSubRows = Boolean(getSubRows);
  const totalColSpan = columns.length + (hasBulkActions ? 1 : 0) + (renderActions ? 1 : 0) + (hasSubRows ? 1 : 0);
  const allVisibleIds = visibleRecords.map(getRecordKey);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.has(id));
  const someSelected = allVisibleIds.some((id) => selectedIds.has(id));

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allVisibleIds));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  if (!records.length) {
    return <EmptyPlaceholder>{emptyText}</EmptyPlaceholder>;
  }

  const selectedCount = selectedIds.size;

  function getDepthBg(depth: number, hasChildren: boolean, isExpanded: boolean) {
    if (depth === 0) {
      if (!hasChildren) return undefined;
      return isExpanded ? 'bg-muted/40' : 'bg-muted/20';
    }
    if (depth === 1) return isExpanded && hasChildren ? 'bg-muted/60' : 'bg-muted/40';
    if (depth === 2) return isExpanded && hasChildren ? 'bg-muted/70' : 'bg-muted/55';
    return 'bg-muted/70';
  }

  function renderRow(record: TRecord, depth = 0): ReactNode[] {
    const key = getRecordKey(record);
    const isDeleted = Boolean(record.deletedAt);
    const isSelected = selectedIds.has(key);
    const subRows = getSubRows?.(record) ?? [];
    const hasChildren = subRows.length > 0;
    const isExpanded = expandedIds.has(key);
    const depthBg = !isDeleted && !isSelected ? getDepthBg(depth, hasChildren, isExpanded) : undefined;

    return [
      <tr
        key={key}
        className={[
          'align-top ',
          isDeleted && 'bg-muted/30 text-muted-foreground',
          isSelected && 'bg-primary/5',
          depthBg,
        ].filter(Boolean).join(' ')}
      >
        {hasBulkActions && (
          <td className="w-10 border-r border-border/80 px-3 py-3">
            <FormBooleanField
              ariaLabel="Выбрать запись"
              checked={isSelected}
              onCheckedChange={() => toggleSelect(key)}
            />
          </td>
        )}

        {hasSubRows && (
          <td className="w-8 border-r border-border/80 px-2 py-3 text-center">
            {hasChildren ? (
              <button
                type="button"
                className="inline-flex cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
                onClick={() => toggleExpand(key)}
              >
                {isExpanded
                  ? <ChevronDown className="size-3.5" strokeWidth={1.5} />
                  : <ChevronRight className="size-3.5" strokeWidth={1.5} />}
              </button>
            ) : null}
          </td>
        )}

        {columns.map((column) => (
          <td
            key={column.key}
            className={[
              'px-4 py-3',
              getAdminTableAlignClassName(column.align),
              isDeleted && 'opacity-60',
            ].filter(Boolean).join(' ')}
          >
            {column.render(record)}
          </td>
        ))}

        {renderActions && (
          <td className="px-4 py-3 text-right">
            {renderActions(record)}
          </td>
        )}
      </tr>,
      ...(isExpanded && hasChildren
        ? subRows.flatMap((sub) => renderRow(sub, depth + 1))
        : []),
    ];
  }

  return (
    <div className="overflow-clip rounded-2xl border border-border/80 bg-background">
      {filterableColumns.length > 0 && (
        <div className="border-b border-border/80 bg-muted/20 p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsFiltersOpen((prev) => !prev)}
                className="group inline-flex items-center gap-1.5 text-left cursor-pointer"
              >
                <p className="text-sm font-medium">Фильтры таблицы</p>
                <div>
                  <ChevronRight
                    className={[
                      'size-4 text-muted-foreground ',
                      isFiltersOpen && 'rotate-90',
                    ].filter(Boolean).join(' ')}
                    strokeWidth={1.5}
                  />
                </div>
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border/80 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground"
                  onClick={resetFilters}
                >
                  <RotateCcw className="size-3.5" strokeWidth={1.5} />
                  Сбросить
                </button>
              )}
            </div>

            {isFiltersOpen && (
              <p className="text-xs text-muted-foreground">
                Показано {visibleRecords.length} из {records.length} записей.
              </p>
            )}

            {isFiltersOpen && (
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
                            className={[
                              'cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-medium ',
                              !filterValue
                                ? 'border-foreground bg-foreground text-background'
                                : 'border-border/80 text-muted-foreground hover:bg-background hover:text-foreground',
                            ].filter(Boolean).join(' ')}
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
                                className={[
                                  'cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-medium ',
                                  isActive
                                    ? 'border-foreground bg-foreground text-background'
                                    : 'border-border/80 text-muted-foreground hover:bg-background hover:text-foreground',
                                ].filter(Boolean).join(' ')}
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
                            name={`${String(column.key)}From`}
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
                            name={`${String(column.key)}To`}
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
                        name={String(column.key)}
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
            )}
          </div>
        </div>
      )}

      {hasBulkActions && selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-border/80 bg-primary/5 px-4 py-3">
          <span className="text-sm font-medium">
            Выбрано: {selectedCount}
          </span>

          <div className="flex flex-wrap gap-2">
            {bulkActions!.map((action, i) => (
              <Button
                key={i}
                type="button"
                size="sm"
                variant={
                  action.variant === 'destructive'
                    ? 'destructive'
                    : action.variant === 'warning'
                      ? 'warning'
                      : 'outline'
                }
                onClick={() => {
                  if (!window.confirm(`${action.label} (${selectedCount} записей)?`)) return;
                  action.onClick(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }}
              >
                {action.icon === 'archive' && <ArchiveX className="size-3.5" strokeWidth={1.5} />}
                {action.icon === 'trash' && <Trash2 className="size-3.5" strokeWidth={1.5} />}
                {action.icon === 'restore' && <Undo2 className="size-3.5" strokeWidth={1.5} />}
                {action.label}
              </Button>
            ))}
          </div>

          <button
            type="button"
            className="ml-auto text-xs text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => setSelectedIds(new Set())}
          >
            Снять выделение
          </button>
        </div>
      )}

      <div className="overflow-auto max-h-[calc(100dvh-14rem)]">
        <table
          className="w-full table-fixed text-left text-sm"
          style={{ minWidth: `${Math.max(tableMinWidth, 760)}px` }}
        >
          <thead className="text-xs tracking-wide text-muted-foreground">
            <tr>
              {hasBulkActions && (
                <th className="sticky top-0 z-10 w-10 border-r border-border/80 bg-muted/80 px-3 py-3 backdrop-blur-md">
                  <FormBooleanField
                    ariaLabel="Выбрать все"
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
              )}

              {hasSubRows && <th className="sticky top-0 z-10 w-8 border-r border-border/80 bg-muted/80 px-2 py-3 backdrop-blur-md" />}

              {columns.map((column) => {
                const width =
                  columnWidths[column.key] ?? getDefaultColumnWidth(column);
                const isResizing = resizingColumnKey === column.key;

                return (
                  <th
                    key={column.key}
                    className={[
                      'group relative sticky top-0 z-10 bg-muted/80 px-4 py-3 font-medium backdrop-blur-md',
                      getAdminTableAlignClassName(column.align),
                    ].filter(Boolean).join(' ')}
                    style={{ width: `${width}px` }}
                  >
                    <button
                      type="button"
                      disabled={!column.sortable}
                      className={[
                        'inline-flex max-w-full items-center gap-2 text-current',
                        column.sortable
                          ? 'cursor-pointer hover:text-foreground'
                          : 'cursor-default',
                      ].filter(Boolean).join(' ')}
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
                        className={[
                          'h-6 w-0.5 rounded-full bg-muted-foreground/45 opacity-0 ',
                          'group-hover:opacity-100',
                          isResizing && 'opacity-100',
                        ].filter(Boolean).join(' ')}
                      />
                    </span>
                  </th>
                );
              })}

              {renderActions && (
                <th className="sticky top-0 z-10 w-[180px] bg-muted/80 px-4 py-3 text-right font-medium backdrop-blur-md">
                  Действия
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {visibleRecords.length ? (
              visibleRecords.flatMap((record) => renderRow(record))
            ) : (
              <tr>
                <td
                  colSpan={totalColSpan}
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
