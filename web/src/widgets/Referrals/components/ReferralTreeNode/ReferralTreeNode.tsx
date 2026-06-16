import type { ReferralTreeUser } from '@/entities/referral';

type ReferralTreeNodeProps = {
  user: ReferralTreeUser;
};

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function ReferralTreeNode({ user }: ReferralTreeNodeProps) {
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <li className="relative pl-5">
      <div className="absolute bottom-0 left-0 top-0 w-px bg-border" />
      <div className="absolute left-0 top-5 h-px w-4 bg-border" />

      <article className="rounded-2xl border border-border bg-background p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-medium">{fullName}</p>

            <p className="mt-1 text-xs text-muted-foreground">
              Приглашён: {dateFormatter.format(new Date(user.invitedAt))}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              Уровень {user.level}
            </span>

            {user.children.length > 0 && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                +{user.children.length}
              </span>
            )}
          </div>
        </div>
      </article>

      {user.children.length > 0 && (
        <ul className="mt-3 space-y-3">
          {user.children.map((childUser) => (
            <ReferralTreeNode key={childUser.id} user={childUser} />
          ))}
        </ul>
      )}
    </li>
  );
}