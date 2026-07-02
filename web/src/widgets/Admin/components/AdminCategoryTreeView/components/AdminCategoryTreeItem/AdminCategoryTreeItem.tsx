import type { ReactNode } from 'react';

import type { AdminCategory } from '@/entities/admin';

import type { AdminCategoryTreeNode } from '../../types/admin-category-tree';

type AdminCategoryTreeItemProps = {
  node: AdminCategoryTreeNode;
  level: number;
  renderTitle: (category: AdminCategory) => ReactNode;
  renderActions: (category: AdminCategory) => ReactNode;
};

export function AdminCategoryTreeItem({
  node,
  level,
  renderTitle,
  renderActions,
}: AdminCategoryTreeItemProps) {
  return (
    <li>
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4"
        style={{
          marginLeft: `${level * 20}px`,
        }}
      >
        <div>
          <p className="font-semibold">{renderTitle(node)}</p>

          <p className="mt-1 text-xs text-muted-foreground">
            slug: {node.slug} · продуктов: {node.productsCount}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">{renderActions(node)}</div>
      </div>

      {node.children.length > 0 && (
        <ul className="mt-3 space-y-3">
          {node.children.map((childNode) => (
            <AdminCategoryTreeItem
              key={childNode.id}
              node={childNode}
              level={level + 1}
              renderTitle={renderTitle}
              renderActions={renderActions}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
