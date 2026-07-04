import { FormSelectField } from '@/components/ui/FormField';
import type { AdminUser } from '@/entities/admin';
import { USER_ROLE_LABELS } from '@/entities/user';
import type { UserRole } from '@/entities/user';

import type { AdminCrudFieldsProps } from '../../types/admin-crud-form';

const roleOptions = (Object.keys(USER_ROLE_LABELS) as UserRole[]).map(
  (role) => ({
    value: role,
    label: USER_ROLE_LABELS[role],
  }),
);

export function UserCrudFields({
  values,
  record,
  onValueChange,
}: AdminCrudFieldsProps) {
  const user = record as AdminUser | undefined;

  return (
    <div className="flex flex-col gap-5">
      {user && (
        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
          <p className="font-semibold">
            {user.firstName} {user.lastName}
          </p>
          <p className="mt-1 text-muted-foreground">{user.email}</p>
        </div>
      )}

      <FormSelectField
        required
        label="Роль пользователя"
        value={String(values.role ?? 'DEFAULT')}
        options={roleOptions}
        onValueChange={(value) => onValueChange('role', value)}
      />
    </div>
  );
}
