export const ADMIN_TABLE_FILTER_STORAGE_PREFIX = "dna.admin.table-filters.v1.";

export function readAdminTableFiltersOpen(
  tableKey: string,
  storage?: Pick<Storage, "getItem">,
) {
  try {
    return (
      storage?.getItem(`${ADMIN_TABLE_FILTER_STORAGE_PREFIX}${tableKey}`) ===
      "open"
    );
  } catch {
    return false;
  }
}

export function writeAdminTableFiltersOpen(
  tableKey: string,
  isOpen: boolean,
  storage?: Pick<Storage, "setItem">,
) {
  try {
    storage?.setItem(
      `${ADMIN_TABLE_FILTER_STORAGE_PREFIX}${tableKey}`,
      isOpen ? "open" : "closed",
    );
  } catch {
    // Storage can be unavailable in privacy mode; persistence is optional.
  }
}
