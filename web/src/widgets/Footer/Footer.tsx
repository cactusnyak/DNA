import { Link } from 'react-router-dom';
import { Mail, Phone, ShieldCheck } from 'lucide-react';

import LogoMain from '@/assets/logos/dna/logo-main.svg?react';

import TelegramLogo from '@/assets/logos/messengers/telegram.svg';
import WhatsAppLogo from '@/assets/logos/messengers/whatsapp.svg';
import MaxLogo from '@/assets/logos/messengers/max.svg';

const navigationLinks = [
  {
    label: 'Каталог',
    href: '/catalog',
  },
  {
    label: 'Категории',
    href: '/categories',
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

const legalLinks = [
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

const contactLinks = [
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

const messengerLinks = [
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

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <section className="space-y-4">
            <Link to="/" className="inline-flex items-center">
              <LogoMain className="h-7 w-auto" aria-label="DNA" />
            </Link>

            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              DNA — онлайн-магазин с кешбэком, партнёрской программой и удобным
              каталогом товаров.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-4" />
              Безопасные покупки и прозрачные условия
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Навигация сайта</h2>

            <nav className="mt-4 flex flex-col gap-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Документы</h2>

            <nav className="mt-4 flex flex-col gap-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Контакты</h2>

            <div className="mt-4 space-y-5">
              <div className="space-y-2">
                {contactLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      <Icon className="size-4" />
                      <span>{link.value}</span>
                    </a>
                  );
                })}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Мессенджеры
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {messengerLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                      <img
                        src={link.logo}
                        alt={link.label}
                        className="size-4 object-contain"
                      />

                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} DNA. Все права защищены.</p>

          <p>
            Цены, наличие и условия кешбэка могут меняться.
          </p>
        </div>
      </div>
    </footer>
  );
}