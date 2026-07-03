import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/Section';

export function SellerPage() {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card p-6">
      <SectionHeader
        title="Аккаунт продавца"
        description="Здесь появится профиль продавца: информация о магазине, товары, условия работы, контакты и будущие настройки продаж. Сейчас это архитектурная заглушка, а не очередная кнопка в никуда."
      />

      <Button asChild variant="outline" className="mt-5">
        <Link to="/market/catalog">Посмотреть каталог маркета</Link>
      </Button>
    </section>
  );
}
