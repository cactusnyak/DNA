import type { AdminCategory } from '@/entities/admin';

export type AdminCategoryTreeNode = AdminCategory & {
  children: AdminCategoryTreeNode[];
};
