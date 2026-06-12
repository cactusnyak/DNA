export type CatalogSortField = 'title' | 'category' | 'createdAt' | 'price';

export type CatalogSortDirection = 'asc' | 'desc';

export type CatalogSortOption = {
  field: CatalogSortField;
  label: string;
};

export type CatalogSortRule = {
  field: CatalogSortField;
  direction: CatalogSortDirection;
};