import { useMemo, useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { User } from '@/entities/user';

import { buildReferralLink } from '../../logic/build-referral-link';

type ReferralLinkCardProps = {
  user: User;
};

export function ReferralLinkCard({ user }: ReferralLinkCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  const referralLink = useMemo(
    () => buildReferralLink(user.referralCode),
    [user.referralCode],
  );

  async function handleCopy() {
    if (!referralLink || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(referralLink);
    setIsCopied(true);

    window.setTimeout(() => {
      setIsCopied(false);
    }, 1600);
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Share2 className="size-3.5" />
            Реферальная ссылка
          </div>

          <h2 className="mt-4 text-xl font-semibold">
            Приглашайте пользователей
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Делитесь ссылкой. Когда пользователь зарегистрируется по вашему
            коду, он попадёт в дерево приглашённых. Да, дерево, только без
            листьев Excel, наконец-то.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background px-4 py-3 text-right">
          <p className="text-xs text-muted-foreground">Ваш код</p>

          <p className="mt-1 text-lg font-semibold tracking-wide">
            {user.referralCode ?? 'Не создан'}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Input readOnly value={referralLink || 'Реферальная ссылка пока недоступна'} />

        <Button
          type="button"
          className="sm:w-44"
          disabled={!referralLink}
          onClick={handleCopy}
        >
          {isCopied ? (
            <>
              <Check className="size-4" />
              Скопировано
            </>
          ) : (
            <>
              <Copy className="size-4" />
              Копировать
            </>
          )}
        </Button>
      </div>
    </section>
  );
}