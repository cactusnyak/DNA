import type { ReactNode } from 'react';
import { WalletCards } from 'lucide-react';

import type { Balance } from '@/entities/balance';
import { formatPrice } from '@/shared/utils/format-price';

type BalanceCardProps = {
  balance?: Balance;
  label?: ReactNode;
  className?: string;
};

export function BalanceCard({
  balance,
  label = 'Баланс',
  className,
}: BalanceCardProps) {
  const balanceValue = balance?.value ?? 0;

  return (
    <section
      className={[
        'balance-card-surface relative isolate w-full min-w-min shrink-0 overflow-hidden rounded-3xl border border-white/15 p-5 text-white shadow-balance-card backdrop-blur-2xl sm:p-6',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="balance-card-primary-glow pointer-events-none absolute -right-20 -top-20 z-0 size-48 rounded-full blur-3xl" />
      <div className="balance-card-accent-glow pointer-events-none absolute -bottom-24 -left-16 z-0 size-52 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="inline-flex items-center rounded-full bg-page/10 p-1 text-xs font-medium text-indigo-100/75">
          <div className="flex items-center gap-1.5 px-3">
            <WalletCards className="size-3.5" />
            {label}
          </div>
          <span className="px-3 text-xs">Только для покупок в DNA</span>
        </div>

        <p className="balance-amount-gradient mt-5 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          {formatPrice(balanceValue)}
        </p>

        <p className="mt-4 text-sm font-semibold tracking-widest text-indigo-100/55">
          {balance?.currency ?? 'RUB'}
        </p>
        <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-white/8 p-3">
            <dt className="text-indigo-100/65">Зарезервировано</dt>
            <dd className="mt-1 font-semibold">{formatPrice(balance?.pendingRewardValue ?? 0)}</dd>
          </div>
          <div className="rounded-xl bg-white/8 p-3">
            <dt className="text-indigo-100/65">В заказах</dt>
            <dd className="mt-1 font-semibold">{formatPrice(balance?.spendingHoldValue ?? 0)}</dd>
          </div>
        </dl>
        {(balance?.debtValue ?? 0) > 0 && (
          <p className="mt-3 rounded-xl bg-dangerous/20 p-3 text-sm">
            Бонусный долг: {formatPrice(balance?.debtValue ?? 0)}. Использование бонусов временно недоступно.
          </p>
        )}
      </div>
    </section>
  );
}
