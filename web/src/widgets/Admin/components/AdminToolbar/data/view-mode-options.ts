import type { AdminViewMode } from '../../../types/admin-management';

export const viewModeOptions = [
  {
    value: 'table',
    label: 'Таблица',
  },
  {
    value: 'list',
    label: 'Список',
  },
  {
    value: 'tree',
    label: 'Дерево',
  },
] satisfies Array<{
  value: AdminViewMode;
  label: string;
}>;
