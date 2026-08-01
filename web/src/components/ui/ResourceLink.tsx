import type { ReactNode } from 'react';

type ResourceLinkProps = {
  href: string;
  children: ReactNode;
};

export function ResourceLink({ href, children }: ResourceLinkProps) {
  const isExternal = /^https?:/i.test(href);

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="text-resource-link underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}
