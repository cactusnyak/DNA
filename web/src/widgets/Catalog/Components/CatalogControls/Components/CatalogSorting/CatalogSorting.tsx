export function CatalogSorting() {
  return (
    <select className="h-10 rounded border border-border bg-background px-3 text-sm">
      <option value="default">По умолчанию</option>
      <option value="price-asc">Сначала дешевле</option>
      <option value="price-desc">Сначала дороже</option>
      <option value="title-asc">По названию</option>
    </select>
  );
}