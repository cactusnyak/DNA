import {
  Boxes,
  ClipboardList,
  Truck,
  FolderTree,
  GitMerge,
  Layers3,
  Megaphone,
  Tags,
  Users,
  Warehouse,
  Network,
  PackageSearch,
} from 'lucide-react';

import type { AdminManagementTabId } from '../types/admin-management';

export type AdminTabGroupId = 'market' | 'logistics' | 'orders' | 'ads' | 'users';

export type AdminManagementTab = {
  id: AdminManagementTabId;
  group: AdminTabGroupId;
  groupLabel: string;
  title: string;
  description: string;
  createLabel?: string;
  icon: typeof FolderTree;
  capabilities?: { create: boolean; edit: boolean; delete: boolean };
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
    id: 'warehouses',
    group: 'logistics',
    groupLabel: 'Логистика',
    title: 'Склады',
    description: 'Точки отправления и конфигурация провайдеров.',
    createLabel: 'Создать склад',
    icon: Warehouse,
    capabilities: { create: true, edit: true, delete: true },
  },
  {
    id: 'delivery-providers',
    group: 'logistics',
    groupLabel: 'Логистика',
    title: 'Провайдеры и сервисы',
    description: 'Доступность интеграций и сервисных семейств.',
    icon: Network,
    capabilities: { create: false, edit: true, delete: false },
  },
  {
    id: 'universal-delivery-quotes',
    group: 'logistics',
    groupLabel: 'Логистика',
    title: 'Расчёты доставки',
    description: 'Универсальные предложения внешних провайдеров.',
    icon: Truck,
    capabilities: { create: false, edit: false, delete: false },
  },
  {
    id: 'shipments',
    group: 'logistics',
    groupLabel: 'Логистика',
    title: 'Отправления',
    description: 'Отправления, позиции и история статусов.',
    icon: PackageSearch,
    capabilities: { create: false, edit: false, delete: false },
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
    id: 'delivery-quotes',
    group: 'orders',
    groupLabel: 'Заказы',
    title: 'КГТ-расчёты доставки',
    description: 'Заявки на расчёт крупногабаритной доставки.',
    icon: Truck,
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
