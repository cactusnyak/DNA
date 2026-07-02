import {
  Boxes,
  ClipboardList,
  FolderTree,
} from 'lucide-react';

export const adminSections = [
  {
    title: 'Категории',
    description: 'Создание, редактирование и структура категорий каталога.',
    status: 'Следующий этап',
    icon: FolderTree,
  },
  {
    title: 'Товары',
    description: 'Товарная база, цены, описания, изображения и привязка к категориям.',
    status: 'После категорий',
    icon: Boxes,
  },
  {
    title: 'Заказы',
    description: 'Просмотр заказов, контактов покупателей и управление статусами.',
    status: 'После товаров',
    icon: ClipboardList,
  },
];
