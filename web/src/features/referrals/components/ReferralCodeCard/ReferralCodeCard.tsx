import { KeyRound } from 'lucide-react';

import type { User } from '@/entities/user';

type ReferralCodeCardProps = {
  user: User;
};

export function ReferralCodeCard({ user }: ReferralCodeCardProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-border bg-card p-5">
      <div className="pointer-events-none absolute -right-14 -top-14 z-0 size-36 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <KeyRound className="size-3.5" />
          Реферальный код
        </div>

        <p className="mt-2 break-all text-2xl font-semibold tracking-wide">
          {user.referralCode ?? 'Не создан'}
        </p>
      </div>
    </section>
  );
}