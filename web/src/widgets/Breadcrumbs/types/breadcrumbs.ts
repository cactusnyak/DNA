export const BREADCRUMB_TYPE = {
  HOME: 'home',
  CATALOG: 'catalog',
  CATEGORY: 'category',
  PRODUCT: 'product',
  STATIC: 'static',
} as const;

export type BreadcrumbType =
  (typeof BREADCRUMB_TYPE)[keyof typeof BREADCRUMB_TYPE];

export type BreadcrumbDescriptor =
  | {
    type: typeof BREADCRUMB_TYPE.HOME;
    label: string;
  }
  | {
    type: typeof BREADCRUMB_TYPE.CATALOG;
    label: string;
    href?: string;
  }
  | {
    type: typeof BREADCRUMB_TYPE.CATEGORY;
    fallbackLabel?: string;
  }
  | {
    type: typeof BREADCRUMB_TYPE.PRODUCT;
    fallbackLabel?: string;
  }
  | {
    type: typeof BREADCRUMB_TYPE.STATIC;
    label: string;
    href?: string;
  };

export type BreadcrumbHandle = {
  breadcrumb?: BreadcrumbDescriptor;
};

export type BreadcrumbMatch = {
  id: string;
  pathname: string;
  params: Record<string, string | undefined>;
  handle?: BreadcrumbHandle;
};

export type BreadcrumbItem = {
  id: string;
  href: string;
  label: string;
};