import { Heart } from 'lucide-react';

import { StateCard } from '@/components/ui/StateCard';

export function FavouritesEmptyState() {
  return (
    <StateCard
      icon={Heart}
      title="В избранном пока ничего нет"
      description="Сохраняйте товары и объявления, чтобы вернуться к ним позже."
      action={{
        label: 'Перейти в каталог',
        to: '/market/catalog',
      }}
    />
  );
}
