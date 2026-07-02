import type { AdminCategory } from '@/entities/admin';

import type { AdminCategoryTreeNode } from '../types/admin-category-tree';

function sortCategoryNodes(nodes: AdminCategoryTreeNode[]) {
  return nodes.sort((firstNode, secondNode) => {
    if (firstNode.sortOrder !== secondNode.sortOrder) {
      return firstNode.sortOrder - secondNode.sortOrder;
    }

    return firstNode.name.localeCompare(secondNode.name);
  });
}

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

  nodeById.forEach((node) => {
    sortCategoryNodes(node.children);
  });

  return sortCategoryNodes(rootNodes);
}
