export type CatalogSortField = 'title' | 'category' | 'createdAt' | 'price';

export type CatalogSortDirection = 'asc' | 'desc';

export type CatalogSortOption = {
  field: CatalogSortField;
  label: string;
  ascLabel: string;
  descLabel: string;
};

export type CatalogSortRule = {
  field: CatalogSortField;
  direction: CatalogSortDirection;
};