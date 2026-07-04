import type { ReactNode } from 'react';

import { AdminCategoryTreeItem } from './components/AdminCategoryTreeItem';
import { buildAdminCategoryTree } from './logic/build-admin-category-tree';
import type { AdminCategoryTreeRecord } from './types/admin-category-tree';

type AdminCategoryTreeViewProps<T extends AdminCategoryTreeRecord> = {
  categories: T[];
  renderTitle: (category: T) => ReactNode;
  renderMeta: (category: T) => ReactNode;
  renderActions: (category: T) => ReactNode;
  emptyText?: string;
};

export function AdminCategoryTreeView<T extends AdminCategoryTreeRecord>({
  categories,
  renderTitle,
  renderMeta,
  renderActions,
  emptyText = 'Категории не найдены.',
}: AdminCategoryTreeViewProps<T>) {
  const tree = buildAdminCategoryTree(categories);

  if (!tree.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {emptyText}
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
          renderMeta={renderMeta}
          renderActions={renderActions}
        />
      ))}
    </ul>
  );
}
