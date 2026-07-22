import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/Section';
import { PLATFORM_SECTION } from '@/shared/platform';
import { CategoryPreview } from '@/widgets/CategoryPreview';
import { ProductsFeed } from '@/widgets/ProductsFeed';

export function MarketPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-border bg-card p-6">
        <SectionHeader
          title="DNA Маркет"
          description="Каталог товаров DNA. Онлайн-оплата, доставка и кабинет продавца пока находятся в разработке."
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/market/catalog">Перейти в каталог</Link>
          </Button>

          <Button asChild variant="outline">
            <Link to="/market/seller">Кабинет продавца — скоро</Link>
          </Button>
        </div>
      </section>

      <CategoryPreview
        section={PLATFORM_SECTION.MARKET}
        title="Категории Маркета"
        emptyText="Здесь пока нет категорий."
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Товары</h2>
        <ProductsFeed />
      </section>
    </div>
  );
}
