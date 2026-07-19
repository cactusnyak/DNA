import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Avatar } from '@/shared/ui/Avatar';
import type { User } from '@/entities/user';

import { getProfileDetailItems } from './data';

type ProfileDetailsCardProps = {
  user: User;
  onEdit: () => void;
  onEditAvatar: () => void;
  onRemoveAvatar: () => void;
};

export function ProfileDetailsCard({
  user,
  onEdit,
  onEditAvatar,
  onRemoveAvatar,
}: ProfileDetailsCardProps) {
  const profileDetails = getProfileDetailItems(user, {
    showRole: user.role === 'ADMIN',
  });

  return (
    <section className='flex flex-col gap-6'>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Личные данные</h2>

        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="mr-2 size-4" />
          Редактировать
        </Button>
      </div>

      <div className="flex items-end gap-3">
        <Avatar src={user.avatar?.url} name={user.nickname} size="lg" />

        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            title={user.avatar ? 'Изменить аватар' : 'Добавить аватар'}
            aria-label={user.avatar ? 'Изменить аватар' : 'Добавить аватар'}
            onClick={onEditAvatar}
          >
            <Pencil className="size-3.5" strokeWidth={1.5} />
          </Button>

          {user.avatar && (
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              title="Удалить аватар"
              aria-label="Удалить аватар"
              onClick={onRemoveAvatar}
            >
              <Trash2 className="size-3.5" strokeWidth={1.5} />
            </Button>
          )}
        </div>
      </div>

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