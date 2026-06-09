import {
  ShoppingCart,
  User,
  WalletCards,
} from 'lucide-react';

export const navigationItems = [
  {
    to: '/referrals',
    label: 'Заработок',
    icon: WalletCards,
  },
  {
    to: '/profile',
    label: 'Профиль',
    icon: User,
  },
  {
    to: '/cart',
    label: 'Корзина',
    icon: ShoppingCart,
  },
];