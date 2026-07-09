type CategoryNode = {
  id: string;
  parentId?: string;
  children?: CategoryNode[];
};

export function buildCategoryTree<T extends CategoryNode>(items: T[]): T[] {
  const byId = new Map<string, T & { children: T[] }>(
    items.map((item) => [item.id, { ...item, children: [] }]),
  );

  const roots: (T & { children: T[] })[] = [];

  for (const item of byId.values()) {
    if (item.parentId && byId.has(item.parentId)) {
      byId.get(item.parentId)!.children.push(item as unknown as T);
    } else {
      roots.push(item);
    }
  }

  return roots as unknown as T[];
}
