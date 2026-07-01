function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

export function filterAdminRecords<TRecord>(
  records: TRecord[],
  searchValue: string,
  getSearchValues: (record: TRecord) => Array<string | number | undefined>,
) {
  const normalizedSearchValue = normalizeSearchValue(searchValue);

  if (!normalizedSearchValue) {
    return records;
  }

  return records.filter((record) =>
    getSearchValues(record).some((value) =>
      String(value ?? '')
        .toLowerCase()
        .includes(normalizedSearchValue),
    ),
  );
}