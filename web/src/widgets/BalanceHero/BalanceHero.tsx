import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import balanceIllustration from '@/assets/illustrations/balance-illustration-v2.png';
import type { Balance } from '@/entities/balance';
import { cn } from '@/shared/utils/cn';
import { BalanceCard } from '@/widgets/BalanceCard';

type BalanceHeroProps = {
  balance?: Balance;
  isAuthenticated?: boolean;
  showReferralLink?: boolean;
  showIllustration?: boolean;
  title?: ReactNode;
  guestText?: ReactNode;
  className?: string;
};

type BalanceHeroActionLinkProps = {
  to: string;
  children: ReactNode;
};

function BalanceHeroActionLink({
  to,
  children,
}: BalanceHeroActionLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'group/link relative isolate flex min-h-24 w-full items-center justify-center gap-2 overflow-hidden rounded-3xl border border-white/20 px-6 py-5 text-lg text-white transition-all duration-500 sm:text-xl',
        'bg-white/5 backdrop-blur-2xl',
        'bg-[radial-gradient(circle_at_30%_20%,rgba(40,39,146,0.28)_0%,rgba(89,69,226,0.22)_25%,rgba(148,225,209,0.16)_50%,rgba(184,180,247,0.15)_75%,rgba(40,39,146,0.22)_100%)] bg-[length:200%_200%] [background-position:0%_0%]',
        'shadow-[0_20px_100px_rgba(89,69,226,0.16)]',
        'hover:scale-[0.98] hover:border-white/24 hover:bg-black/15 hover:backdrop-blur-[10px] hover:[background-position:100%_100%] hover:shadow-[0_30px_140px_rgba(148,225,209,0.18),inset_0_1px_0_rgba(245,249,253,0.22)]',
        'active:translate-y-0 active:scale-[0.99]',
        'before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(circle_at_25%_15%,rgba(245,249,253,0.12),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(148,225,209,0.10),transparent_50%),radial-gradient(circle_at_50%_50%,rgba(184,180,247,0.08),transparent_55%)] before:opacity-0 before:transition-opacity before:duration-700 hover:before:opacity-0',
        'after:pointer-events-none after:absolute after:inset-y-[-50%] after:left-[-40%] after:z-0 after:w-1/2 after:rotate-12 after:bg-[#F5F9FD]/5 after:blur-2xl after:transition-transform after:duration-[1000ms] hover:after:translate-x-[500%]',
      )}
    >
      <span className="relative z-10">{children}</span>

      <ArrowRight className="relative z-10 size-6 transition-transform duration-300 group-hover/link:translate-x-1" />
    </Link>
  );
}

export function BalanceHero({
  balance,
  isAuthenticated = false,
  showReferralLink = true,
  showIllustration = true,
  title = 'Деньги с DNA',
  guestText,
  className,
}: BalanceHeroProps) {
  return (
    <section
      className={cn(
        'bg-gradient-to-br from-[#020817] via-[#0F1D3D] to-[#09122E]',
        'group relative isolate flex flex-col justify-end rounded-[30px] p-2 sm:rounded-[30px] md:rounded-[40px] md:p-5 lg:rounded-[45px] lg:p-6',
        showIllustration && 'lg:my-25 lg:mx-5 xl:my-30',
        className,
      )}
    >
      {showIllustration && (
        <img
          src={balanceIllustration}
          alt=""
          loading="lazy"
          className={cn(
            'pointer-events-none absolute z-10 max-w-none select-none object-contain',
            'drop-shadow-[0_36px_45px_rgba(99,102,241,0.45)]',
            'transition-all duration-700 ease-out',
            'hidden lg:block',
            'lg:-right-[1%] lg:top-[50%] lg:w-[75%] lg:max-w-none lg:scale-[1] lg:-translate-y-1/2',
            'xl:scale-[1] xl:-translate-y-1/2',
          )}
        />
      )}

      <div className="relative flex gap-2 md:gap-3 z-20 flex w-full flex-col justify-end">
        {isAuthenticated ? (
          <div
            className={cn(
              'grid w-full gap-4',
              showReferralLink
                ? 'lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)]'
                : 'lg:grid-cols-1',
            )}
          >
            <BalanceCard balance={balance} />

            {showReferralLink && (
              <BalanceHeroActionLink to="/referrals">
                Зарабатывать
              </BalanceHeroActionLink>
            )}
          </div>
        ) : (
          <div className="mt-8 grid w-full gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)]">
            <p className="rounded-xl bg-white p-5 leading-relaxed text-black sm:text-md">
              {guestText}
            </p>

            <BalanceHeroActionLink to="/authorization">
              Зарегистрироваться
            </BalanceHeroActionLink>
          </div>
        )}
      </div>
    </section>
  );
}