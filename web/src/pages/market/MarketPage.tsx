import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { ContentCard } from '@/components/ui/ContentCard';
import { SectionHeader } from '@/components/ui/Section';
import { PLATFORM_SECTION } from '@/shared/platform';
import { CategoryPreview } from '@/widgets/CategoryPreview';
import { ProductsFeed } from '@/widgets/ProductsFeed';

export function MarketPage() {
  return (
    <ContentCard>
      <section className="">
        <SectionHeader
          title="DNA Маркет"
          description="Каталог товаров DNA. Онлайн-оплата, доставка и кабинет продавца пока находятся в разработке."
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild variant="accent">
            <Link to="/market/catalog">Перейти в каталог</Link>
          </Button>

          <Button asChild variant="secondary">
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
    </ContentCard>
  );
}
