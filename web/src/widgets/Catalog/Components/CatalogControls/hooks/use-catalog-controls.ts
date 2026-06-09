export type CatalogSortValue =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'title-asc';

export function useCatalogControls() {
  const sortingOptions = [
    {
      value: 'default',
      label: 'По умолчанию',
    },
    {
      value: 'price-asc',
      label: 'Сначала дешевле',
    },
    {
      value: 'price-desc',
      label: 'Сначала дороже',
    },
    {
      value: 'title-asc',
      label: 'По названию',
    },
  ] satisfies {
    value: CatalogSortValue;
    label: string;
  }[];

  return {
    sortingOptions,
  };
}