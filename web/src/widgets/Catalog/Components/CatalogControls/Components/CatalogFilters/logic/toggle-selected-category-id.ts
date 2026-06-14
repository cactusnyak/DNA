export function toggleSelectedCategoryId(
  selectedCategoryIds: string[],
  categoryId: string,
) {
  if (selectedCategoryIds.includes(categoryId)) {
    return selectedCategoryIds.filter((id) => id !== categoryId);
  }

  return [...selectedCategoryIds, categoryId];
}