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
      <div>
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:gap-10 md:flex-row md:items-start md:gap-12 lg:gap-16 xl:gap-20">
          <div className="shrink-0 md:w-48 lg:w-56 xl:w-64">
            <FooterBrand />
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
            <FooterLinkGroup title="Компания" links={companyLinks} />
            <FooterLinkGroup title="Покупателям" links={buyerLinks} />
            <FooterLinkGroup title="Пользователям" links={userLinks} />
            <FooterLinkGroup title="Персональные данные" links={personalDataLinks} />
            <FooterContacts contacts={contactLinks} messengers={[]} />
          </div>
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
