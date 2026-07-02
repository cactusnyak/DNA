import type { AdminManagementTabId } from '../../../types/admin-management';
import type { EditableRecord } from '../types/admin-management-records';

export function getCrudFormModalTitle(
  tabId: AdminManagementTabId,
  record?: EditableRecord,
) {
  if (tabId === 'orders') {
    return 'Изменение статуса заказа';
  }

  const actionLabel = record ? 'Редактирование' : 'Создание';

  if (tabId === 'categories') {
    return `${actionLabel} категории`;
  }

  if (tabId === 'products') {
    return `${actionLabel} продукта`;
  }

  if (tabId === 'collections') {
    return `${actionLabel} подборки`;
  }

  return 'Форма управления';
}
