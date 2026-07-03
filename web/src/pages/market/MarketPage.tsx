import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/Section';
import { PLATFORM_SECTION } from '@/shared/platform';
import { Catalog } from '@/widgets/Catalog';
import { CategoryPreview } from '@/widgets/CategoryPreview';

export function MarketPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-border bg-card p-6">
        <SectionHeader
          title="Маркет"
          description="Товары DNA и будущие предложения продавцов в одном разделе. Магазинная часть уже работает, продавцов подключим отдельной итерацией. Чудо дисциплины, почти пугает."
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/market/catalog">Перейти в каталог</Link>
          </Button>

          <Button asChild variant="outline">
            <Link to="/cart">Корзина</Link>
          </Button>
        </div>
      </section>

      <CategoryPreview
        section={PLATFORM_SECTION.MARKET}
        title="Категории маркета"
      />

      <Catalog
        section={PLATFORM_SECTION.MARKET}
        title="Популярные товары маркета"
        showHeader
        showCatalogLink
        showControls={false}
      />
    </div>
  );
}
