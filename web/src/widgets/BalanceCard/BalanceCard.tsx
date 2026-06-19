import type { ReactNode } from 'react';

import type { Balance } from '@/entities/balance';
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
        'relative isolate w-full overflow-hidden rounded-3xl border border-white/15 bg-[#0B1433]/70 p-5 text-white shadow-[0_10px_100px_rgba(0,0,0,0.16)] backdrop-blur-2xl transition-all duration-500 hover:border-white/25 hover:bg-[#0B1433]/78 sm:p-6',
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 z-0 size-48 rounded-full bg-[#5945E2]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 z-0 size-52 rounded-full bg-[#94E1D1]/18 blur-3xl" />

      <div className="relative z-10">
        <p className="text-sm font-medium tracking-widest text-indigo-100/75">
          {label}
        </p>

        <p className="mt-3 bg-gradient-to-r from-white via-indigo-100 to-cyan-100 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          {formatPrice(balanceValue)}
        </p>

        <p className="mt-4 text-sm font-semibold tracking-widest text-indigo-100/55">
          {balance?.currency ?? 'RUB'}
        </p>
      </div>
    </section>
  );
}