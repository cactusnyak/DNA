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
    description: 'После регистрации вы получите код и ссылку для приглашений.',
    icon: Share2,
  },
  {
    title: 'Доход с сети',
    description: 'Рефералка готовится к многоуровневой структуре приглашений.',
    icon: Network,
  },
  {
    title: 'Начисления на баланс',
    description: 'Бонусы будут попадать в баланс после подтверждённых событий.',
    icon: WalletCards,
  },
  {
    title: 'Кешбэк и бонусы',
    description: 'Покупки и приглашения станут частью единой экономики DNA.',
    icon: BadgePercent,
  },
];