import type { AdminManagementTabId } from '../../../types/admin-management';
import type { EditableRecord } from '../types/admin-management-records';

export function getCrudFormModalTitle(
  tabId: AdminManagementTabId,
  record?: EditableRecord,
) {
  if (tabId === 'orders') {
    return 'Изменение статуса заказа';
  }

  if (tabId === 'ads') {
    return 'Модерация объявления';
  }

  if (tabId === 'users') {
    return 'Изменение роли пользователя';
  }

  const actionLabel = record ? 'Редактирование' : 'Создание';

  if (tabId === 'market-categories') {
    return `${actionLabel} категории маркета`;
  }

  if (tabId === 'market-products') {
    return `${actionLabel} товара`;
  }

  if (tabId === 'collections') {
    return `${actionLabel} подборки`;
  }

  if (tabId === 'ad-categories') {
    return `${actionLabel} категории объявлений`;
  }

  return 'Форма управления';
}
