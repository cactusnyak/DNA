import type { User } from '@/entities/user';

import { getProfileDetailItems } from './data';

type ProfileDetailsCardProps = {
  user: User;
};

export function ProfileDetailsCard({ user }: ProfileDetailsCardProps) {
  const profileDetails = getProfileDetailItems(user);

  return (
    <section>
      <h2 className="text-lg font-semibold">Личные данные</h2>

      <dl className="mt-5 overflow-hidden rounded-xl border border-border">
        {profileDetails.map((item) => (
          <div
            key={item.label}
            className="grid gap-1 border-b border-border px-4 py-3 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4"
          >
            <dt className="text-sm text-muted-foreground">{item.label}</dt>

            <dd
              className={[
                'break-words text-sm',
                item.isAccent ? 'font-semibold' : 'font-medium',
              ].join(' ')}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}