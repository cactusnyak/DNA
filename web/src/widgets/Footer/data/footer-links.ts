import { Mail, Phone } from 'lucide-react';

import TelegramLogo from '@/assets/logos/messengers/telegram.svg';
import WhatsAppLogo from '@/assets/logos/messengers/whatsapp.svg';
import MaxLogo from '@/assets/logos/messengers/max.svg';

export const navigationLinks = [
  {
    label: 'Каталог',
    href: '/catalog',
  },
  {
    label: 'Корзина',
    href: '/cart',
  },
  {
    label: 'Профиль',
    href: '/profile',
  },
  {
    label: 'Заработок',
    href: '/referrals',
  },
];

export const legalLinks = [
  {
    label: 'Пользовательское соглашение',
    href: '/legal/terms',
  },
  {
    label: 'Политика конфиденциальности',
    href: '/legal/privacy',
  },
  {
    label: 'Публичная оферта',
    href: '/legal/offer',
  },
  {
    label: 'Правила возврата',
    href: '/legal/refund',
  },
  {
    label: 'Правила партнёрской программы',
    href: '/legal/referral',
  },
];

export const contactLinks = [
  {
    value: 'hello@dna.local',
    href: 'mailto:hello@dna.local',
    icon: Mail,
  },
  {
    value: '+7 (000) 000-00-00',
    href: 'tel:+70000000000',
    icon: Phone,
  },
];

export const messengerLinks = [
  {
    label: 'Telegram',
    href: '#',
    logo: TelegramLogo,
  },
  {
    label: 'WhatsApp',
    href: '#',
    logo: WhatsAppLogo,
  },
  {
    label: 'MAX',
    href: '#',
    logo: MaxLogo,
  },
];