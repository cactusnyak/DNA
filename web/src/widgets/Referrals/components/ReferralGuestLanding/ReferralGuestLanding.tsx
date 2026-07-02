import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CircleDollarSign,
  Network,
  Sparkles,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';

import { referralBenefits } from '../../data/referral-benefits';

export function ReferralGuestLanding() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5" />
            Раздел заработка DNA
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
              Приглашайте людей. Получайте бонусы. Не продавайте душу баннерной рекламе.
            </h1>

            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              После регистрации вы получите реферальный код, ссылку для
              приглашений, баланс и будущую историю начислений. Покупать в DNA
              можно и без аккаунта, но заработок открывается только в профиле.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/authorization">
                Войти или зарегистрироваться
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link to="/catalog">Сначала посмотреть товары</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-border bg-background/80 p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted/60 p-4">
                <Users className="size-5 text-muted-foreground" />
                <p className="mt-4 text-2xl font-semibold">∞</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Потенциальная сеть
                </p>
              </div>

              <div className="rounded-2xl bg-muted/60 p-4">
                <CircleDollarSign className="size-5 text-muted-foreground" />
                <p className="mt-4 text-2xl font-semibold">₽</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Будущие начисления
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-foreground p-5 text-background">
              <Network className="size-5 opacity-80" />

              <p className="mt-4 text-sm font-medium">
                Реферальная структура будет расти деревом: ваши приглашённые,
                их приглашённые и следующие уровни до заданного порога.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {referralBenefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <article
              key={benefit.title}
              className="rounded-2xl border border-border bg-background/80 p-4"
            >
              <Icon className="size-5 text-muted-foreground" />

              <h2 className="mt-4 text-sm font-semibold">
                {benefit.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {benefit.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}