import {
  BadgePercent,
  CircleDollarSign,
  Network,
  KeyRoundIcon,
} from 'lucide-react';

import type { ReferralBenefit } from '../types/referral-benefit';

export const referralBenefits: ReferralBenefit[] = [
  {
    title: 'Личный код',
    description: 'После регистрации доступны код и ссылка для приглашений.',
    icon: KeyRoundIcon,
  },
  {
    title: 'Дерево приглашений',
    description:
      'В профиле можно посмотреть пользователей, зарегистрированных по вашей ссылке.',
    icon: Network,
  },
  {
    title: 'Начисления',
    description: 'Получайте вознаграждения от покупок приглашённых участников на доступных уровнях партнёрской цепочки.',
    icon: CircleDollarSign,
  },
  {
    title: 'Кешбэк и бонусы',
    description: 'Используйте доступные бонусы для оплаты части стоимости товаров в DNA Маркете.',
    icon: BadgePercent,
  },
];
