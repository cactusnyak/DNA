export type BreadcrumbHandle = {
  breadcrumb?: string;
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