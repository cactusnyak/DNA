import type { CatalogSortOption } from '../types/catalog-sorting';

export const catalogSortOptions: CatalogSortOption[] = [
  {
    field: 'title',
    label: 'Название',
    ascLabel: 'А → Я',
    descLabel: 'Я → А',
  },
  {
    field: 'category',
    label: 'Категория',
    ascLabel: 'А → Я',
    descLabel: 'Я → А',
  },
  {
    field: 'createdAt',
    label: 'Дата',
    ascLabel: 'Старые',
    descLabel: 'Новые',
  },
  {
    field: 'price',
    label: 'Стоимость',
    ascLabel: 'Дешевле',
    descLabel: 'Дороже',
  },
];