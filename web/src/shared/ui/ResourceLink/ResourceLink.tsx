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
      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
    >
      {children}
    </a>
  );
}
