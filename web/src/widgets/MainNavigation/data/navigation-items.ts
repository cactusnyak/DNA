import {
  Heart,
  Home,
  ShieldCheck,
  ShoppingCart,
  User,
  BadgeRussianRuble,
} from 'lucide-react';

import type { MainNavigationItem } from '../types/main-navigation-item';

export const navigationItems: MainNavigationItem[] = [
  {
    to: '/',
    label: 'Главная',
    icon: Home,
  },
  {
    to: '/referrals',
    label: 'Заработок',
    icon: BadgeRussianRuble,
  },
  {
    to: '/favourites',
    label: 'Избранное',
    icon: Heart,
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
  {
    to: '/admin',
    label: 'Админка',
    icon: ShieldCheck,
    allowedRoles: ['ADMIN'],
  },
];