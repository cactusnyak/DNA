import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import balanceIllustration from '@/assets/illustrations/balance-illustration.png';
import type { Balance } from '@/entities/balance';
import { cn } from '@/shared/utils/cn';
import { formatPrice } from '@/shared/utils/format-price';

type BalanceOverviewProps = {
  balance?: Balance;
  isAuthenticated?: boolean;
  showReferralLink?: boolean;
  title?: ReactNode;
  guestText?: ReactNode;
  className?: string;
};

export function BalanceOverview({
  balance,
  isAuthenticated = false,
  showReferralLink = true,
  title = 'Ваш баланс',
  guestText = 'Зарегистрируйтесь, чтобы видеть баланс, получать кешбэк, участвовать в реферальной системе и отслеживать будущие начисления.',
  className,
}: BalanceOverviewProps) {
  const balanceValue = balance?.value ?? 0;

  return (
    <section
      className={cn(
        'group relative isolate m-5 mt-15 mb-15 flex flex-col justify-end p-6 sm:p-8 md:p-10',
        className,
      )}
    >
      <div className="absolute -right-28 -top-28 z-0 h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-[90px] transition-all duration-700 group-hover:bg-indigo-500/30" />
      <div className="absolute -bottom-32 -left-32 z-0 h-[360px] w-[360px] rounded-full bg-cyan-500/15 blur-[90px]" />

      <div className="absolute inset-0 z-0 overflow-hidden rounded-[2.5rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020817] via-[#0F1D3D] to-[#09122E]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/30 via-indigo-950/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-950/40 via-transparent to-cyan-900/20" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />
      </div>

      <img
        src={balanceIllustration}
        alt=""
        loading="lazy"
        className={cn(
          'pointer-events-none absolute z-10 max-w-none select-none object-contain',
          'drop-shadow-[0_36px_45px_rgba(99,102,241,0.45)]',
          'transition-all duration-700 ease-out',
          'group-hover:-translate-y-4 group-hover:scale-105',
          'hidden sm:block',
          'sm:right-[0%] sm:-top-[15%] sm:w-[90%] sm:max-w-none',
          'md:-top-[20%] md:w-[85%]',
          'lg:-top-[25%] lg:w-[80%]',
          'xl:-top-[30%] xl:w-[75%] xl:max-w-[860px]',
        )}
      />

      <div className="relative z-20 flex w-full flex-col justify-end">
        <h2 className="max-w-xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
          {title}
        </h2>

        {isAuthenticated ? (
          <div className="mt-8 flex w-full flex-col gap-4 lg:flex-row lg:items-stretch">
            <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-5 shadow-[0_10px_100px_rgba(0,0,0,0.1)] backdrop-blur-2xl transition-all duration-500 hover:border-white/25 hover:bg-white/15 sm:p-6 lg:shrink-0">
              <p className="text-sm font-medium tracking-widest text-indigo-100/75">
                Доступно сейчас
              </p>

              <p className="mt-3 bg-gradient-to-r from-white via-indigo-100 to-cyan-100 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
                {formatPrice(balanceValue)}
              </p>

              <p className="mt-4 text-sm font-semibold tracking-widest text-indigo-100/55">
                {balance?.currency ?? 'RUB'}
              </p>
            </div>

            {showReferralLink && (
              <Link
                to="/referrals"
                className={cn(
                  'group/link flex w-full min-h-24 flex-1 items-center justify-center gap-2 rounded-3xl border border-white/15 bg-white/5 px-6 py-5 text-lg font-bold text-white shadow-[0_10px_100px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-500',
                  'hover:-translate-y-1 hover:border-white/25 hover:bg-white/15 hover:shadow-[0_20px_120px_rgba(99,102,241,0.18)] sm:text-xl',
                )}
              >
                <span>Зарабатывать</span>

                <ArrowRight className="size-6 text-indigo-100/80 transition-transform duration-300 group-hover/link:translate-x-1" />
              </Link>
            )}
          </div>
        ) : (
          <p className="mt-6 max-w-md text-base leading-relaxed text-indigo-100/75 sm:text-lg sm:leading-8">
            {guestText}
          </p>
        )}
      </div>
    </section>
  );
}