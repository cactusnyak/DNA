import {
  Boxes,
  ClipboardList,
  FolderTree,
  Layers3,
} from 'lucide-react';

import type { AdminManagementTabId } from '../types/admin-management';

export type AdminManagementTab = {
  id: AdminManagementTabId;
  title: string;
  description: string;
  createLabel?: string;
  icon: typeof FolderTree;
};

export const adminManagementTabs: AdminManagementTab[] = [
  {
    id: 'categories',
    title: 'Категории',
    description: 'Структура каталога, дерево, изображения и сортировка.',
    createLabel: 'Создать категорию',
    icon: FolderTree,
  },
  {
    id: 'products',
    title: 'Продукты',
    description: 'Товары, услуги, цены, описания и привязка к категориям.',
    createLabel: 'Создать продукт',
    icon: Boxes,
  },
  {
    id: 'collections',
    title: 'Подборки',
    description: 'Витрины главной страницы и будущие тематические блоки.',
    createLabel: 'Создать подборку',
    icon: Layers3,
  },
  {
    id: 'orders',
    title: 'Заказы',
    description: 'Просмотр заказов и изменение статусов.',
    icon: ClipboardList,
  },
];