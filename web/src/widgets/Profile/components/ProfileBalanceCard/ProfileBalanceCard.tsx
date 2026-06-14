import { Button } from '@/components/ui/Button';
import type { User } from '@/entities/user';
import { formatPrice } from '@/shared/utils/format-price';

type ProfileBalanceCardProps = {
  user: User;
  onLogout: () => void;
};

export function ProfileBalanceCard({
  user,
  onLogout,
}: ProfileBalanceCardProps) {
  const balanceValue = user.balance?.value ?? 0;

  return (
    <aside className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold">Баланс</h2>

      <p className="mt-4 text-3xl font-semibold">
        {formatPrice(balanceValue)}
      </p>

      <p className="mt-2 text-sm text-muted-foreground">
        Баланс будет использоваться для кешбэка, реферальных начислений и
        будущих выводов средств.
      </p>

      <Button
        type="button"
        variant="outline"
        className="mt-6 w-full"
        onClick={onLogout}
      >
        Выйти
      </Button>
    </aside>
  );
}