import type { AdminCategory } from '@/entities/admin';

export type AdminCategoryTreeNode = AdminCategory & {
  children: AdminCategoryTreeNode[];
};

export function buildAdminCategoryTree(categories: AdminCategory[]) {
  const nodeById = new Map<string, AdminCategoryTreeNode>();

  categories.forEach((category) => {
    nodeById.set(category.id, {
      ...category,
      children: [],
    });
  });

  const rootNodes: AdminCategoryTreeNode[] = [];

  nodeById.forEach((node) => {
    if (!node.parentId) {
      rootNodes.push(node);
      return;
    }

    const parentNode = nodeById.get(node.parentId);

    if (!parentNode) {
      rootNodes.push(node);
      return;
    }

    parentNode.children.push(node);
  });

  return rootNodes.sort((firstNode, secondNode) => {
    if (firstNode.sortOrder !== secondNode.sortOrder) {
      return firstNode.sortOrder - secondNode.sortOrder;
    }

    return firstNode.name.localeCompare(secondNode.name);
  });
}