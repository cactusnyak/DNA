import { useEffect, useMemo, useState } from 'react';

import { filterAdminTableRecords } from './filter-admin-table-records';
import { getAdminTableFilterConfig } from './get-admin-table-filter-config';
import { getAdminTableMinWidth } from './get-admin-table-min-width';
import { getColumnMinWidth, getDefaultColumnWidth } from './get-default-column-width';
import { getInitialColumnWidths } from './get-initial-column-widths';
import { getNextColumnWidth } from './get-next-column-width';
import { getNextSortState } from './get-next-sort-state';
import { hasActiveAdminTableFilters } from './has-active-admin-table-filters';
import { sortAdminTableRecords } from './sort-admin-table-records';
import { syncColumnWidths } from './sync-column-widths';
import {
  getUpdatedAdminTableFilterValues,
  getUpdatedAdminTableRangeFilterValues,
} from './update-admin-table-filter-value';

import type {
  AdminTableColumn,
  AdminTableFilterRangeValue,
  AdminTableFilterValue,
  AdminTableFilterValues,
  AdminTableResizeColumnHandler,
  AdminTableSortState,
} from '../types/admin-records-table';

type UseAdminRecordsTableStateParams<TRecord> = {
  records: TRecord[];
  columns: AdminTableColumn<TRecord>[];
  hasActions: boolean;
};

export function useAdminRecordsTableState<TRecord>({
  records,
  columns,
  hasActions,
}: UseAdminRecordsTableStateParams<TRecord>) {
  const [sortState, setSortState] = useState<AdminTableSortState>(null);
  const [filterValues, setFilterValues] = useState<AdminTableFilterValues>({});
  const [resizingColumnKey, setResizingColumnKey] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState(() =>
    getInitialColumnWidths(columns),
  );

  useEffect(() => {
    setColumnWidths((currentWidths) =>
      syncColumnWidths(columns, currentWidths),
    );
  }, [columns]);

  const filterableColumns = useMemo(
    () => columns.filter((column) => getAdminTableFilterConfig(column)),
    [columns],
  );

  const filteredRecords = useMemo(
    () => filterAdminTableRecords(records, columns, filterValues),
    [records, columns, filterValues],
  );

  const visibleRecords = useMemo(
    () => sortAdminTableRecords(filteredRecords, columns, sortState),
    [filteredRecords, columns, sortState],
  );

  const hasActiveFilters = hasActiveAdminTableFilters(filterValues);

  const tableMinWidth = useMemo(
    () =>
      getAdminTableMinWidth({
        columns,
        columnWidths,
        hasActions,
      }),
    [columns, columnWidths, hasActions],
  );

  function updateFilterValue(columnKey: string, value: AdminTableFilterValue) {
    setFilterValues((currentValues) =>
      getUpdatedAdminTableFilterValues(currentValues, columnKey, value),
    );
  }

  function updateRangeFilterValue(
    columnKey: string,
    field: keyof AdminTableFilterRangeValue,
    value: string,
  ) {
    setFilterValues((currentValues) =>
      getUpdatedAdminTableRangeFilterValues(
        currentValues,
        columnKey,
        field,
        value,
      ),
    );
  }

  function resetFilters() {
    setFilterValues({});
  }

  function handleSortClick(column: AdminTableColumn<TRecord>) {
    if (!column.sortable) {
      return;
    }

    setSortState((currentSortState) =>
      getNextSortState(currentSortState, column.key),
    );
  }

  const handleColumnResizeStart: AdminTableResizeColumnHandler<TRecord> = (
    event,
    column,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = columnWidths[column.key] ?? getDefaultColumnWidth(column);
    const minWidth = getColumnMinWidth(column);

    setResizingColumnKey(column.key);

    function handlePointerMove(pointerMoveEvent: globalThis.PointerEvent) {
      const diff = pointerMoveEvent.clientX - startX;

      setColumnWidths((currentWidths) => ({
        ...currentWidths,
        [column.key]: getNextColumnWidth(startWidth + diff, minWidth),
      }));
    }

    function handlePointerUp() {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);

      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      setResizingColumnKey(null);
    }

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  return {
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
  };
}
