import {
  Boxes,
  ClipboardList,
  FolderTree,
  GitMerge,
  Layers3,
  Megaphone,
  Tags,
  Users,
} from 'lucide-react';

import type { AdminManagementTabId } from '../types/admin-management';

export type AdminTabGroupId = 'market' | 'orders' | 'ads' | 'users';

export type AdminManagementTab = {
  id: AdminManagementTabId;
  group: AdminTabGroupId;
  groupLabel: string;
  title: string;
  description: string;
  createLabel?: string;
  icon: typeof FolderTree;
};

export const adminManagementTabs: AdminManagementTab[] = [
  {
    id: 'market-categories',
    group: 'market',
    groupLabel: 'Маркет',
    title: 'Категории маркета',
    description: 'Структура каталога маркета, дерево, изображения и сортировка.',
    createLabel: 'Создать категорию маркета',
    icon: FolderTree,
  },
  {
    id: 'market-products',
    group: 'market',
    groupLabel: 'Маркет',
    title: 'Товары маркета',
    description: 'Товары маркета, цены, описания и привязка к категориям.',
    createLabel: 'Создать товар',
    icon: Boxes,
  },
  {
    id: 'collections',
    group: 'market',
    groupLabel: 'Маркет',
    title: 'Подборки',
    description: 'Витрины главной страницы и тематические блоки маркета.',
    createLabel: 'Создать подборку',
    icon: Layers3,
  },
  {
    id: 'orders',
    group: 'orders',
    groupLabel: 'Заказы',
    title: 'Заказы',
    description: 'Просмотр заказов и изменение статусов.',
    icon: ClipboardList,
  },
  {
    id: 'ad-categories',
    group: 'ads',
    groupLabel: 'Объявления',
    title: 'Категории объявлений',
    description: 'Иерархия категорий доски объявлений, дерево и сортировка.',
    createLabel: 'Создать категорию объявлений',
    icon: Tags,
  },
  {
    id: 'ads',
    group: 'ads',
    groupLabel: 'Объявления',
    title: 'Объявления',
    description: 'Модерация и управление объявлениями пользователей.',
    icon: Megaphone,
  },
  {
    id: 'users',
    group: 'users',
    groupLabel: 'Пользователи',
    title: 'Пользователи',
    description: 'Управление пользователями, ролями и доступом.',
    icon: Users,
  },
  {
    id: 'referrals',
    group: 'users',
    groupLabel: 'Пользователи',
    title: 'Рефералы',
    description: 'Реферальные цепочки, уровни и участники программы.',
    icon: GitMerge,
  },
];
