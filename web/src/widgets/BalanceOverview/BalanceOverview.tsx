import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import balanceIllustration from '@/assets/illustrations/balance-illustration-v2.png';
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
  title = 'Деньги с DNA',
  guestText = 'Зарегистрируйтесь, чтобы видеть баланс, получать кешбэк, участвовать в реферальной системе и отслеживать будущие начисления.',
  className,
}: BalanceOverviewProps) {
  const balanceValue = balance?.value ?? 0;

  return (
    <section
      className={cn(
        'group relative isolate m-5 mt-30 mb-30 flex flex-col justify-end p-6 sm:p-8 md:p-10',
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
          'hidden sm:block',
          'sm:-right-[10%] sm:top-[50%] sm:w-[90%] sm:max-w-none sm:scale-[1.6] sm:-translate-y-1/2',
          'md:scale-[1.5] md:-translate-y-1/2',
          'lg:scale-[1.15] lg:-translate-y-1/2',
          'xl:scale-[1] xl:-translate-y-1/2',
        )}
      />

      <div className="relative z-20 flex w-full flex-col justify-end">
        <h2 className="max-w-xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
          {title}
        </h2>

        {isAuthenticated ? (
          <div
            className={cn(
              'mt-8 grid w-full gap-4',
              'lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)]'
            )}
          >
            <div className="w-full overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-5 shadow-[0_10px_100px_rgba(0,0,0,0.1)] backdrop-blur-2xl transition-all duration-500 hover:border-white/25 hover:bg-white/15 sm:p-6">
              <p className="text-sm font-medium uppercase tracking-widest text-indigo-100/75">
                Баланс
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
                  'group/link relative isolate flex min-h-24 w-full items-center justify-center gap-2 overflow-hidden rounded-3xl border border-white/20 px-6 py-5 text-lg font-bold text-white transition-all duration-500 sm:text-xl',
                  'bg-white/8 backdrop-blur-xl',
                  'bg-[radial-gradient(circle_at_30%_20%,rgba(40,39,146,0.42)_0%,rgba(89,69,226,0.34)_25%,rgba(148,225,209,0.26)_50%,rgba(184,180,247,0.24)_75%,rgba(40,39,146,0.34)_100%)] bg-[length:200%_200%] [background-position:0%_0%]',
                  'shadow-[0_20px_100px_rgba(89,69,226,0.22)]',
                  'hover:-translate-y-1 hover:scale-[1.01] hover:[background-position:100%_100%] hover:shadow-[0_30px_140px_rgba(148,225,209,0.25),inset_0_1px_0_rgba(245,249,253,0.30)]',
                  'active:translate-y-0 active:scale-[0.99]',
                  'before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(circle_at_25%_15%,rgba(245,249,253,0.18),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(148,225,209,0.16),transparent_50%),radial-gradient(circle_at_50%_50%,rgba(184,180,247,0.13),transparent_55%)] before:opacity-55 before:transition-opacity before:duration-700 hover:before:opacity-85',
                  'after:pointer-events-none after:absolute after:inset-y-[-50%] after:left-[-40%] after:z-0 after:w-1/2 after:rotate-12 after:bg-[#F5F9FD]/8 after:blur-2xl after:transition-transform after:duration-[1000ms] hover:after:translate-x-[500%]',
                )}
              >
                <span className="relative z-10">Зарабатывать</span>

                <ArrowRight className="relative z-10 size-6 transition-transform duration-300 group-hover/link:translate-x-1" />
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