import { LogIn } from 'lucide-react';

import { StateCard } from '@/components/ui/StateCard';

export function ProfileUnauthorizedState() {
  return (
    <StateCard
      icon={LogIn}
      title="Профиль недоступен"
      description="Войдите или зарегистрируйтесь, чтобы видеть историю заказов, реферальный код и дерево приглашений. Финансовые функции пока разрабатываются."
      action={{
        label: 'Войти или зарегистрироваться',
        to: '/authorization',
      }}
    />
  );
}
