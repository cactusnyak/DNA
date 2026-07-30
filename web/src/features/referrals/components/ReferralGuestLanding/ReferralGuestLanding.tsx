import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/Button';

import { referralBenefits } from '../../data/referral-benefits';

export function ReferralGuestLanding() {
  const dividerClass = 'border-primary/8';

  return (
    <section className="relative overflow-hidden rounded-4xl bg-card p-6 shadow-card-2xl sm:p-8 lg:p-10">
      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] lg:items-center lg:gap-14">
        <div className="max-w-3xl space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-4" />
            Реферальная программа
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold leading-tight sm:text-5xl text-primary">
              Приглашайте пользователей по персональной ссылке
            </h1>

            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              После регистрации доступны реферальный код, ссылка и дерево
              приглашений. Начисления и условия программы пока разрабатываются.
              Заказ в Маркете можно оформить без регистрации.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="accent" size="lg">
              <Link to="/authorization">
                Войти или зарегистрироваться
                <ArrowRight
                  className="size-4 group-hover/button:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {referralBenefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                key={benefit.title}
                className={[
                  'flex min-h-40 flex-col bg-background/80 p-5',
                  '[&:not(:last-child)]:border-b',
                  'sm:[&:not(:last-child)]:border-b-0',
                  'sm:[&:nth-child(-n+2)]:border-b',
                  'sm:[&:nth-child(odd)]:border-r',
                  dividerClass,
                ].filter(Boolean).join(' ')}
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>

                <h2 className="mt-5 text-base font-semibold">
                  {benefit.title}
                </h2>

                <p className="mt-2 text-sm leading-5.5 text-muted-foreground">
                  {benefit.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
