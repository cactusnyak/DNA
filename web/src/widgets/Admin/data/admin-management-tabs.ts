import {
  Boxes,
  ClipboardList,
  FolderTree,
  Layers3,
  Megaphone,
  Tags,
  Users,
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
    id: 'market-categories',
    title: 'Категории маркета',
    description: 'Структура каталога маркета, дерево, изображения и сортировка.',
    createLabel: 'Создать категорию маркета',
    icon: FolderTree,
  },
  {
    id: 'market-products',
    title: 'Товары маркета',
    description: 'Товары маркета, цены, описания и привязка к категориям.',
    createLabel: 'Создать товар',
    icon: Boxes,
  },
  {
    id: 'collections',
    title: 'Подборки',
    description: 'Витрины главной страницы и тематические блоки маркета.',
    createLabel: 'Создать подборку',
    icon: Layers3,
  },
  {
    id: 'orders',
    title: 'Заказы',
    description: 'Просмотр заказов и изменение статусов.',
    icon: ClipboardList,
  },
  {
    id: 'ad-categories',
    title: 'Категории объявлений',
    description: 'Иерархия категорий доски объявлений, дерево и сортировка.',
    createLabel: 'Создать категорию объявлений',
    icon: Tags,
  },
  {
    id: 'ads',
    title: 'Объявления',
    description: 'Модерация и управление объявлениями пользователей.',
    icon: Megaphone,
  },
  {
    id: 'users',
    title: 'Пользователи',
    description: 'Управление пользователями, ролями и доступом.',
    icon: Users,
  },
];
