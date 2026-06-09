import type { Product } from '@/entities/product';

type CatalogDropdownProductsProps = {
  products: Product[];
  activeCategoryName?: string;
  isPending?: boolean;
  onProductClick?: () => void;
};

export function CatalogDropdownProducts({
  products,
  activeCategoryName,
  isPending = false,
  onProductClick,
}: CatalogDropdownProductsProps) {
  return (
    <aside className="min-w-0 overflow-y-auto p-4">
      <p className="mb-3 text-sm font-medium">
        {activeCategoryName
          ? `Товары категории «${activeCategoryName}»`
          : 'Все товары'}
      </p>

      {isPending && (
        <p className="text-sm text-muted-foreground">Загрузка товаров...</p>
      )}

      {!isPending && !products.length && (
        <p className="text-sm text-muted-foreground">Товары не найдены.</p>
      )}

      {!!products.length && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {products.slice(0, 12).map((product) => {
            const image = product.images[0];

            return (
              <a
                key={product.id}
                href={`/product/${product.id}`}
                onClick={onProductClick}
                className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-foreground/30"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  {image && (
                    <img
                      src={image.url}
                      alt={image.alt ?? product.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>

                <div className="p-1.5">
                  <p className="line-clamp-2 text-[11px] font-medium leading-snug">
                    {product.title}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </aside>
  );
}