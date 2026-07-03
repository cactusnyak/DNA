import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/Section';

export function AdsMyPage() {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card p-6">
      <SectionHeader
        title="Мои объявления"
        description="Здесь появится управление объявлениями пользователя: черновики, модерация, активные и архивные публикации. Сейчас это архитектурная заглушка, не декоративная лень."
      />

      <Button asChild variant="outline" className="mt-5">
        <Link to="/ads/catalog">Посмотреть каталог доски</Link>
      </Button>
    </section>
  );
}
