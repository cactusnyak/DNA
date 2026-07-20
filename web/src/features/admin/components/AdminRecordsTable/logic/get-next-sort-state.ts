import type { AdminTableSortState } from '../types/admin-records-table';

export function getNextSortState(
  currentSortState: AdminTableSortState,
  columnKey: string,
): AdminTableSortState {
  if (!currentSortState || currentSortState.key !== columnKey) {
    return {
      key: columnKey,
      direction: 'asc',
    };
  }

  if (currentSortState.direction === 'asc') {
    return {
      key: columnKey,
      direction: 'desc',
    };
  }

  return null;
}
