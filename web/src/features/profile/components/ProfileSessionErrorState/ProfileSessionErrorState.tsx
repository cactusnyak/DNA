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
      description="Сессия завершена. Войдите снова."
      action={{
        label: 'Выйти из профиля',
        onClick: onLogout,
      }}
    />
  );
}
