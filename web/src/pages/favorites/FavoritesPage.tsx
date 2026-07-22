import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/Section';

export function FavoritesPage() {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card p-6">
      <SectionHeader
        title="Избранное"
        description="Сохранённые товары Маркета и объявления Доски."
      />

      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/market/catalog">Каталог маркета</Link>
        </Button>

        <Button asChild variant="outline">
          <Link to="/ads/catalog">Каталог доски</Link>
        </Button>
      </div>
    </section>
  );
}
