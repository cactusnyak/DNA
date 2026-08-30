import { Link } from 'react-router-dom';

import { BrandLogo } from '@/components/ui/BrandLogo';

export function FooterBrand() {
  return (
    <section className="space-y-4">
      <Link to="/" className="inline-flex items-center">
        <BrandLogo />
      </Link>

      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        DNA — код новой экономики.
      </p>
    </section>
  );
}
