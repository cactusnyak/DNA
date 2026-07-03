import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/Section';
import { PLATFORM_SECTION } from '@/shared/platform';
import { CategoryPreview } from '@/widgets/CategoryPreview';

export function AdsPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-border bg-card p-6">
        <SectionHeader
          title="Доска"
          description="Раздел для объявлений пользователей. Сейчас готовим интерфейсную архитектуру, а реальные объявления, модерацию и карточки подключим следующим слоем. Люди снова смогут продавать всё подряд, но хотя бы структурно."
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/ads/catalog">Каталог доски</Link>
          </Button>

          <Button asChild variant="outline">
            <Link to="/ads/my">Мои объявления</Link>
          </Button>
        </div>
      </section>

      <CategoryPreview
        section={PLATFORM_SECTION.ADS}
        title="Категории доски"
        emptyText="Категории доски пока не добавлены."
      />
    </div>
  );
}
