import type { ReactNode } from 'react';

import type {
  AdminCategoryTreeNode,
  AdminCategoryTreeRecord,
} from '../../types/admin-category-tree';

type AdminCategoryTreeItemProps<T extends AdminCategoryTreeRecord> = {
  node: AdminCategoryTreeNode<T>;
  level: number;
  renderTitle: (category: T) => ReactNode;
  renderMeta: (category: T) => ReactNode;
  renderActions: (category: T) => ReactNode;
};

export function AdminCategoryTreeItem<T extends AdminCategoryTreeRecord>({
  node,
  level,
  renderTitle,
  renderMeta,
  renderActions,
}: AdminCategoryTreeItemProps<T>) {
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
            {renderMeta(node)}
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
              renderMeta={renderMeta}
              renderActions={renderActions}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
