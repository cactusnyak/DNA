import type { ReactNode } from 'react';

import type { AdminCategory } from '@/entities/admin';

import { AdminCategoryTreeItem } from './components/AdminCategoryTreeItem';
import { buildAdminCategoryTree } from './logic/build-admin-category-tree';

type AdminCategoryTreeViewProps = {
  categories: AdminCategory[];
  searchValue: string;
  renderTitle: (category: AdminCategory) => ReactNode;
  renderActions: (category: AdminCategory) => ReactNode;
};

export function AdminCategoryTreeView({
  categories,
  renderTitle,
  renderActions,
}: AdminCategoryTreeViewProps) {
  const tree = buildAdminCategoryTree(categories);

  if (!tree.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Категории не найдены.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tree.map((node) => (
        <AdminCategoryTreeItem
          key={node.id}
          node={node}
          level={0}
          renderTitle={renderTitle}
          renderActions={renderActions}
        />
      ))}
    </ul>
  );
}
