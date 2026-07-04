export type AdminCategoryTreeRecord = {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  sortOrder: number;
};

export type AdminCategoryTreeNode<T extends AdminCategoryTreeRecord> = T & {
  children: AdminCategoryTreeNode<T>[];
};
