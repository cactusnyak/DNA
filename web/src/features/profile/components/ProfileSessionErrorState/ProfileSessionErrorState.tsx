import { CircleAlert } from 'lucide-react';

import { StateCard } from '@/components/ui/StateCard';

type ProfileSessionErrorStateProps = {
  onLogout: () => void;
};

export function ProfileSessionErrorState({
  onLogout,
}: ProfileSessionErrorStateProps) {
  return (
    <StateCard
      icon={CircleAlert}
      title="Сессия недоступна"
      description="Не удалось получить данные пользователя. Возможно, токен устарел."
      action={{
        label: 'Выйти из профиля',
        onClick: onLogout,
      }}
    />
  );
}