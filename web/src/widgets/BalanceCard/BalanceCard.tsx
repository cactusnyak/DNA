import type { ReactNode } from 'react';
import { WalletCards } from 'lucide-react';

import type { Balance } from '@/entities/balance';
import { Button } from '@/components/ui/Button';
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
          <div className="flex gap-0.5">
            <Button
              className="h-fit flex-1 rounded-l-full rounded-r-[3px] border-white/20 bg-page/10 px-2.5 py-1 text-xs text-white hover:bg-black/20 hover:text-white"
              onClick={() =>
                window.alert('Функция пополнения баланса находится в разработке')
              }
            >
              Пополнить
            </Button>

            <Button
              className="h-fit flex-1 rounded-l-[3px] rounded-r-full border-white/20 bg-page/10 px-2.5 py-1 text-xs text-white hover:bg-black/20 hover:text-white"
              onClick={() =>
                window.alert('Функция вывода средств находится в разработке')
              }
            >
              Вывести
            </Button>
          </div>
        </div>

        <p className="balance-amount-gradient mt-5 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          {formatPrice(balanceValue)}
        </p>

        <p className="mt-4 text-sm font-semibold tracking-widest text-indigo-100/55">
          {balance?.currency ?? 'RUB'}
        </p>
      </div>
    </section>
  );
}
