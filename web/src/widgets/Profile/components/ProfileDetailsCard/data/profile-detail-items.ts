import { USER_ROLE_LABELS, type User } from '@/entities/user';
import { formatPrice } from '@/shared/utils/format-price';

export type ProfileDetailItem = {
  label: string;
  value: string;
  isAccent?: boolean;
};

function getFullName(user: User) {
  const parts = [user.lastName, user.firstName, user.patronymic].filter(
    Boolean,
  );

  return parts.join(' ') || 'Не указано';
}

export function getProfileDetailItems(
  user: User,
  options?: { showRole?: boolean },
): ProfileDetailItem[] {
  const balanceValue = user.balance?.value ?? 0;
  const items: ProfileDetailItem[] = [
    { label: 'Имя аккаунта', value: user.nickname },
    { label: 'ФИО', value: getFullName(user) },
    { label: 'Email', value: user.email },
    { label: 'Телефон', value: user.phone ?? 'Не указан' },
    { label: 'Реферальный код', value: user.referralCode ?? 'Не создан' },
    { label: 'Баланс', value: formatPrice(balanceValue), isAccent: true },
  ];

  if (options?.showRole) {
    items.splice(3, 0, {
      label: 'Роль',
      value: USER_ROLE_LABELS[user.role],
    });
  }

  return items;
}