import { FooterBrand } from './components/FooterBrand';
import { FooterContacts } from './components/FooterContacts';
import { FooterLinkGroup } from './components/FooterLinkGroup';
import {
  contactLinks,
  buyerLinks,
  companyLinks,
  personalDataLinks,
  userLinks,
} from './data/footer-links';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <FooterBrand />

          <FooterLinkGroup title="Компания" links={companyLinks} />
          <FooterLinkGroup title="Покупателям" links={buyerLinks} />
          <FooterLinkGroup title="Пользователям" links={userLinks} />
          <FooterLinkGroup title="Персональные данные" links={personalDataLinks} />

          <FooterContacts contacts={contactLinks} messengers={[]} />
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
