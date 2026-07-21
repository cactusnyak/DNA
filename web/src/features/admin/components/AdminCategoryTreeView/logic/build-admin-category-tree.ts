import type {
  AdminCategoryTreeNode,
  AdminCategoryTreeRecord,
} from '../types/admin-category-tree';

function sortCategoryNodes<T extends AdminCategoryTreeRecord>(
  nodes: AdminCategoryTreeNode<T>[],
) {
  return nodes.sort((firstNode, secondNode) => {
    if (firstNode.sortOrder !== secondNode.sortOrder) {
      return firstNode.sortOrder - secondNode.sortOrder;
    }

    return firstNode.name.localeCompare(secondNode.name);
  });
}

export function buildAdminCategoryTree<T extends AdminCategoryTreeRecord>(
  categories: T[],
) {
  const nodeById = new Map<string, AdminCategoryTreeNode<T>>();

  categories.forEach((category) => {
    nodeById.set(category.id, {
      ...category,
      children: [],
    });
  });

  const rootNodes: AdminCategoryTreeNode<T>[] = [];

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
