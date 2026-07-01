import type { ReactNode } from 'react';

import type { AdminCategory } from '@/entities/admin';

import {
  buildAdminCategoryTree,
  type AdminCategoryTreeNode,
} from '../../logic/build-admin-category-tree.ts';

type AdminCategoryTreeViewProps = {
  categories: AdminCategory[];
  searchValue: string;
  renderTitle: (category: AdminCategory) => ReactNode;
  renderActions: (category: AdminCategory) => ReactNode;
};

function AdminCategoryTreeItem({
  node,
  level,
  renderTitle,
  renderActions,
}: {
  node: AdminCategoryTreeNode;
  level: number;
  renderTitle: (category: AdminCategory) => ReactNode;
  renderActions: (category: AdminCategory) => ReactNode;
}) {
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