import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/Section';
import { PLATFORM_SECTION } from '@/shared/platform';
import { AdsFeed } from '@/widgets/AdsFeed';
import { CategoryPreview } from '@/widgets/CategoryPreview';

export function AdsPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-border bg-card p-6">
        <SectionHeader
          title="Доска объявлений"
          description="Размещайте объявления о продаже товаров и услуг, находите предложения других пользователей и связывайтесь с продавцами напрямую."
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/ads/new">Разместить объявление</Link>
          </Button>

          <Button asChild variant="outline">
            <Link to="/ads/my">Мои объявления</Link>
          </Button>

          <Button asChild variant="outline">
            <Link to="/ads/catalog">Категории доски</Link>
          </Button>
        </div>
      </section>

      <CategoryPreview
        section={PLATFORM_SECTION.ADS}
        title="Категории доски"
        emptyText="Категории доски пока не добавлены."
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Последние объявления</h2>
        <AdsFeed />
      </section>
    </div>
  );
}
