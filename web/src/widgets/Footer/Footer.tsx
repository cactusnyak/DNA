import { FooterBrand } from './components/FooterBrand';
import { FooterContacts } from './components/FooterContacts';
import { FooterLinkGroup } from './components/FooterLinkGroup';
import {
  contactLinks,
  legalLinks,
  messengerLinks,
  navigationLinks,
} from './data/footer-links';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <FooterBrand />

          <FooterLinkGroup title="Навигация сайта" links={navigationLinks} />

          <FooterLinkGroup title="Документы" links={legalLinks} />

          <FooterContacts
            contacts={contactLinks}
            messengers={messengerLinks}
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} DNA. Все права защищены.</p>

          <p>Цены, наличие и условия кешбэка могут меняться.</p>
        </div>
      </div>
    </footer>
  );
}