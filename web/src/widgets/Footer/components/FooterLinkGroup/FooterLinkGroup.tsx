import { TextLink } from '@/components/ui/TextLink';
import { SectionTitle } from '@/components/ui/Section';

type FooterLink = {
  label: string;
  href: string;
};

type FooterLinkGroupProps = {
  title: string;
  links: FooterLink[];
};

export function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>

      <nav className="mt-4 flex flex-col gap-2">
        {links.map((link) => (
          <TextLink key={link.href} to={link.href} className="text-sm">
            {link.label}
          </TextLink>
        ))}
      </nav>
    </section>
  );
}