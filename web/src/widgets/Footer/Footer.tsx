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
    <footer className="border-t border-border bg-muted/30">
      <div className="">
        <div className="mx-auto max-w-7xl px-4 py-10 grid gap-20 md:grid-cols-[auto_auto_auto_auto]">
          <FooterBrand />

          <FooterLinkGroup title="Навигация сайта" links={navigationLinks} />

          <FooterLinkGroup title="Документы" links={legalLinks} />

          <FooterContacts
            contacts={contactLinks}
            messengers={messengerLinks}
          />
        </div>

        <div className="border-t border-border text-xs text-muted-foreground">
          <div className="mx-auto max-w-7xl px-4 py-8 flex flex-col gap-2 md:flex-row md:items-center">
            <p>© {currentYear} DNA. Все права защищены.</p>

            <span className="hidden md:inline">|</span>

            <p>Цены и наличие товаров могут меняться. Финансовые функции пока разрабатываются.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
