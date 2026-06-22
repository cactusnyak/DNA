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
    <section className="flex h-full flex-col rounded-3xl border border-border bg-card p-5">
      <div className="flex-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <Share2 className="size-3.5" />
          Реферальная ссылка
        </div>

        <h2 className="mt-4 text-xl font-semibold">
          Приглашайте пользователей
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Делитесь ссылкой. Когда пользователь зарегистрируется по вашему коду,
          он попадёт в дерево приглашённых. Да, дерево, только без листьев
          Excel, наконец-то.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Input
          readOnly
          value={referralLink || 'Реферальная ссылка пока недоступна'}
        />

        <Button
          type="button"
          disabled={!referralLink}
          onClick={handleCopy}
        >
          {isCopied ? (
            <>
              <Check className="size-4" />
            </>
          ) : (
            <>
              <Copy className="size-4" />
            </>
          )}
        </Button>
      </div>
    </section>
  );
}