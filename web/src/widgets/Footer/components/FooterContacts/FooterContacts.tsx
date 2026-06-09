import { SectionTitle } from '@/components/ui/Section';

import { FooterMessengers } from '../FooterMessengers';

type ContactLink = {
  value: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
};

type MessengerLink = {
  label: string;
  href: string;
  logo: string;
};

type FooterContactsProps = {
  contacts: ContactLink[];
  messengers: MessengerLink[];
};

export function FooterContacts({
  contacts,
  messengers,
}: FooterContactsProps) {
  return (
    <section>
      <SectionTitle>Контакты</SectionTitle>

      <div className="mt-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Почта и телефон
        </p>

        <div className="space-y-2">
          {contacts.map((link) => {
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
      </div>

      <div className="mt-6">
        <FooterMessengers links={messengers} />
      </div>
    </section>
  );
}