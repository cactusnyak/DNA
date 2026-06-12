import type { CatalogSortOption } from '../types/catalog-sorting';

export const catalogSortOptions: CatalogSortOption[] = [
  {
    field: 'title',
    label: 'Название',
  },
  {
    field: 'category',
    label: 'Категория',
  },
  {
    field: 'createdAt',
    label: 'Дата',
  },
  {
    field: 'price',
    label: 'Стоимость',
  },
];