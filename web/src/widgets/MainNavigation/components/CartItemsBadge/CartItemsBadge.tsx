import { useCartStore } from '@/entities/cart';

export function CartItemsBadge() {
  const totalProductItems = useCartStore((state) => state.getTotalItems());
  const totalAdItems = useCartStore((state) => state.getTotalAdItems());
  const totalItems = totalProductItems + totalAdItems;

  if (totalItems <= 0) {
    return null;
  }

  const label = totalItems > 99 ? '99+' : String(totalItems);

  return (
    <span className="absolute -right-2 -top-2 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] leading-4 text-primary-foreground">
      {label}
    </span>
  );
}