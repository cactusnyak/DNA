import type { ReferralTreeUser } from '@/entities/referral';

type ReferralTreeNodeProps = {
  user: ReferralTreeUser;
  isLast?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function ReferralTreeNode({ user, isLast: _isLast = false }: ReferralTreeNodeProps) {
  const displayName = user.nickname;
  const formattedDate = user.invitedAt
    ? dateFormatter.format(new Date(user.invitedAt))
    : 'Дата неизвестна';

  return (
    <li className="relative flex">
      <div className="mt-[13px] h-fit p-2">
        <div className="h-[2px] w-2 rounded-full bg-border" />
      </div>

      <div className="w-fit">
        <article className="w-fit rounded-xl bg-muted/50 px-4 py-3 transition-colors hover:bg-muted/80">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm">{displayName}</p>
              <time className="text-xs text-muted-foreground" dateTime={user.invitedAt}>
                {formattedDate}
              </time>
            </div>
          </div>
        </article>

        {user.children.length > 0 && (
          <ul className="mt-3 space-y-3">
            {user.children.map((childUser, index) => (
              <ReferralTreeNode
                key={childUser.id}
                user={childUser}
                isLast={index === user.children.length - 1}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}