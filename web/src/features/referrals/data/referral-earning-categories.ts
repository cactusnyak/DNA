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
        'За отмеченные товары покупателю начисляется бонус, а участникам его партнёрской цепочки — вознаграждение согласно уровням товара. Начисление становится доступным после доставки заказа.',
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
    description: 'Размер бонусного фонда и распределение по уровням задаются отдельно для каждого товара.',
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
