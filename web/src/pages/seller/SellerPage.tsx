import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { ContentCard } from '@/components/ui/ContentCard';
import { SectionHeader } from '@/components/ui/Section';

export function SellerPage() {
  return (
    <ContentCard as="section">
      <SectionHeader
        title="Аккаунт продавца"
        description="Кабинет продавца пока находится в разработке."
      />

      <Button asChild variant="secondary">
        <Link to="/market/catalog">Посмотреть каталог Маркета</Link>
      </Button>
    </ContentCard>
  );
}
