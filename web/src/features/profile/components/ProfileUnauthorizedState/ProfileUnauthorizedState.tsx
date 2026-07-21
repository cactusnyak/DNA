import { LogIn } from 'lucide-react';

import { StateCard } from '@/components/ui/StateCard';

export function ProfileUnauthorizedState() {
  return (
    <StateCard
      icon={LogIn}
      title="Профиль недоступен"
      description="Войдите или зарегистрируйтесь, чтобы видеть историю заказов, баланс, кешбэк и реферальную систему."
      action={{
        label: 'Войти или зарегистрироваться',
        to: '/authorization',
      }}
    />
  );
}