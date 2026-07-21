import type { ReactNode } from 'react';
import { WalletCards } from 'lucide-react';

import type { Balance } from '@/entities/balance';
import { Button } from '@/components/ui/Button';
import { cn } from '@/shared/utils/cn';
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
      className={cn(
        'relative isolate w-full overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#050816] via-[#050816] to-[#0B1433] p-5 text-white shadow-[0_10px_100px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-500 sm:p-6',
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 z-0 size-48 rounded-full bg-[#5945E2]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 z-0 size-52 rounded-full bg-[#94E1D1]/18 blur-3xl" />

      <div className="relative z-10">
        <div className="inline-flex items-center rounded-full bg-white/10 p-1 text-xs font-medium text-indigo-100/75">
          <div className="flex items-center gap-1.5 px-3">
            <WalletCards className="size-3.5" />
            {label}
          </div>
          <div className="flex gap-0.5">
            <Button
              className="flex-1 h-fit border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white rounded-full rounded-r-[3px]"
              onClick={() =>
                window.alert('Функция пополнения баланса находится в разработке')
              }
            >
              Пополнить
            </Button>

            <Button
              className="flex-1 h-fit border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white rounded-full rounded-l-[3px]"
              onClick={() =>
                window.alert('Функция вывода средств находится в разработке')
              }
            >
              Вывести
            </Button>
          </div>
        </div>

        <p className="mt-5 bg-gradient-to-r from-white via-indigo-100 to-cyan-100 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          {formatPrice(balanceValue)}
        </p>

        <p className="mt-4 text-sm font-semibold tracking-widest text-indigo-100/55">
          {balance?.currency ?? 'RUB'}
        </p>
      </div>
    </section>
  );
}