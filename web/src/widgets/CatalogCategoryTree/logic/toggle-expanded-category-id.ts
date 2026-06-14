export function toggleExpandedCategoryId(
  categoryIds: Set<string>,
  categoryId: string,
) {
  const nextCategoryIds = new Set(categoryIds);

  if (nextCategoryIds.has(categoryId)) {
    nextCategoryIds.delete(categoryId);
  } else {
    nextCategoryIds.add(categoryId);
  }

  return nextCategoryIds;
}
