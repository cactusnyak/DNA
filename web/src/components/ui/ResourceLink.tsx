import type { ReactNode } from 'react';

type ResourceLinkProps = {
  href: string;
  children: ReactNode;
};

export function ResourceLink({ href, children }: ResourceLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-resource-link underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}