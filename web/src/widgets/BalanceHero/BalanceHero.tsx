import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import balanceIllustration from '@/assets/illustrations/balance-illustration-v2.png';
import type { Balance } from '@/entities/balance';
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
      className="balance-hero-action-surface group/link relative isolate flex min-h-24 w-full items-center justify-center gap-2 overflow-hidden rounded-3xl border border-white/20 px-6 py-5 text-lg text-white shadow-brand-glow backdrop-blur-2xl transition-all duration-500 before:pointer-events-none before:absolute before:inset-0 before:z-0 before:opacity-0 before:transition-opacity before:duration-700 after:pointer-events-none after:absolute after:inset-y-[-50%] after:left-[-40%] after:z-0 after:w-1/2 after:rotate-12 after:blur-2xl after:transition-transform after:duration-[1000ms] hover:scale-[0.98] hover:border-white/24 hover:backdrop-blur-[10px] hover:shadow-accent-glow hover:before:opacity-0 hover:after:translate-x-[500%] active:translate-y-0 active:scale-[0.99] sm:text-xl"
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
      className={`balance-hero-surface group relative isolate flex flex-col justify-end rounded-[30px] p-2 shadow-card-3xl sm:rounded-[30px] md:rounded-[40px] md:p-4 lg:rounded-[40px] lg:p-4 ${showIllustration ? 'lg:mx-5 lg:my-25 xl:my-30' : ''} ${className ?? ''}`}
    >
      {showIllustration && (
        <img
          src={balanceIllustration}
          alt=""
          loading="lazy"
          className="pointer-events-none absolute z-10 hidden max-w-none select-none object-contain drop-shadow-[0_36px_45px_rgba(99,102,241,0.45)] lg:-right-[1%] lg:top-[50%] lg:block lg:w-[75%] lg:max-w-none lg:scale-[1] lg:-translate-y-1/2 xl:scale-[1] xl:-translate-y-1/2"
        />
      )}

      <div className="relative flex gap-2 md:gap-3 z-20 flex w-full flex-col justify-end">
        {isAuthenticated ? (
          <div
            className={`grid w-full gap-4 ${showReferralLink ? 'lg:grid-cols-[minmax(min-content,3fr)_minmax(0,7fr)]' : 'lg:grid-cols-1'}`}
          >
            <BalanceCard balance={balance} label={title} />

            {showReferralLink && (
              <BalanceHeroActionLink to="/referrals">
                Реферальная программа
              </BalanceHeroActionLink>
            )}
          </div>
        ) : (
          <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)]">
            <div className="rounded-3xl border border-white/20 bg-page/5 p-6 text-white backdrop-blur-2xl">
              <h2 className="text-xl font-semibold">{title}</h2>
              {guestText && (
                <p className="mt-2 text-sm text-indigo-100/75">{guestText}</p>
              )}
            </div>
            <BalanceHeroActionLink to="/authorization">
              Зарегистрироваться
            </BalanceHeroActionLink>
          </div>
        )}
      </div>
    </section>
  );
}
