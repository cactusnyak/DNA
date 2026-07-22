import {
  BadgePercent,
  Network,
  Share2,
  WalletCards,
} from 'lucide-react';

import type { ReferralBenefit } from '../types/referral-benefit';

export const referralBenefits: ReferralBenefit[] = [
  {
    title: 'Личный код',
    description: 'После регистрации доступны код и ссылка для приглашений.',
    icon: Share2,
  },
  {
    title: 'Дерево приглашений',
    description: 'В профиле можно посмотреть пользователей, зарегистрированных по вашей ссылке.',
    icon: Network,
  },
  {
    title: 'Начисления',
    description: 'Механика начислений и её условия пока разрабатываются.',
    icon: WalletCards,
  },
  {
    title: 'Кешбэк и бонусы',
    description: 'Кешбэк и бонусная программа пока не запущены.',
    icon: BadgePercent,
  },
];
