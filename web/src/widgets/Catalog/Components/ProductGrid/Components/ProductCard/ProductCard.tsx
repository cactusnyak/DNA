import type { Product } from '@/entities/product';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images[0];

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      {mainImage && (
        <img
          src={mainImage.url}
          alt={mainImage.alt ?? product.title}
          className="aspect-square w-full object-cover"
        />
      )}

      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 font-medium">{product.title}</h3>

        <p className="line-clamp-3 text-sm text-muted-foreground">
          {product.description}
        </p>

        <p className="text-lg font-semibold">
          {product.price.toLocaleString('ru-RU')} ₽
        </p>
      </div>
    </article>
  );
}