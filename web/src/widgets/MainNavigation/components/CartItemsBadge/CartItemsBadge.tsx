import { useCartStore } from '@/entities/cart';

export function CartItemsBadge() {
  const totalItems = useCartStore((state) => state.getTotalItems());

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