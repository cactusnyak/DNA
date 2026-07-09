import { Link } from 'react-router-dom';

import LogoMain from '@/assets/logos/dna/logo-main.svg?react';

export function FooterBrand() {
  return (
    <section className="space-y-4">
      <Link to="/" className="inline-flex items-center">
        <LogoMain className="h-7 w-auto" aria-label="DNA" />
      </Link>

      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        DNA — код новой экономики.
      </p>
    </section>
  );
}