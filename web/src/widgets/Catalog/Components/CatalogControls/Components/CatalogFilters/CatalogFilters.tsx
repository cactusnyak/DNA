export function CatalogFilters() {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="rounded-s border border-border px-3 py-2 text-sm">
        Все товары
      </button>

      <button className="rounded-s border border-border px-3 py-2 text-sm">
        Электроника
      </button>

      <button className="rounded-s border border-border px-3 py-2 text-sm">
        Спорт
      </button>
    </div>
  );
}