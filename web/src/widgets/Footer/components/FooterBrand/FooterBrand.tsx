import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

import LogoMain from '@/assets/logos/dna/logo-main.svg?react';

export function FooterBrand() {
  return (
    <section className="space-y-4">
      <Link to="/" className="inline-flex items-center">
        <LogoMain className="h-7 w-auto" aria-label="DNA" />
      </Link>

      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        DNA — код новой экономики. Онлайн-магазин с кешбэком, партнёрской программой и удобным
        каталогом товаров.
      </p>

      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-4" />
        Безопасные покупки и прозрачные условия
      </div>
    </section>
  );
}