import {
  BadgePercent,
  Network,
  PackagePlus,
} from 'lucide-react';

import type { ReferralEarningCategory } from '../types/referral-earning-category';

export const referralEarningCategories: ReferralEarningCategory[] = [
  {
    id: 'personal-cashback',
    title: 'Личный кешбэк',
    shortTitle: 'Кешбэк',
    description: 'Механика кешбэка пока находится в разработке.',
    icon: BadgePercent,
    details: {
      title: 'Личный кешбэк',
      paragraphs: [
        'Кешбэк в DNA Маркете пока не начисляется. Условия, ставки и порядок начисления будут опубликованы перед запуском.',
      ],
      examples: [],
    },
  },
  {
    id: 'referral-income',
    title: 'Реферальный доход',
    shortTitle: 'Приглашения',
    description: 'Доход по реферальной программе пока не начисляется.',
    icon: Network,
    details: {
      title: 'Реферальный доход',
      paragraphs: [
        'Реферальный код, ссылка и дерево приглашений уже доступны в профиле.',
        'Начисления, уровни дохода и ставки пока разрабатываются. Актуальные условия будут опубликованы перед запуском программы.',
      ],
      examples: [],
    },
  },
  {
    id: 'drop-income',
    title: 'Дроп-доход',
    shortTitle: 'Дроп',
    description: 'Программа для поставщиков и товаров пока не запущена.',
    icon: PackagePlus,
    details: {
      title: 'Дроп-доход',
      paragraphs: [
        'Механика вознаграждений за привлечение поставщиков или добавление товаров пока разрабатывается.',
        'Условия участия и расчёта вознаграждений будут опубликованы перед запуском.',
      ],
      examples: [],
    },
  },
];
