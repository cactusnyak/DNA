import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import {
  getPlatformCatalogHref,
  type PlatformSectionId,
} from '@/shared/platform';

type CatalogHeaderProps = {
  section: PlatformSectionId;
  title: string;
  showCatalogLink?: boolean;
};

export function CatalogHeader({
  section,
  title,
  showCatalogLink = false,
}: CatalogHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-semibold">{title}</h1>

      {showCatalogLink && (
        <Button asChild variant="outline">
          <Link to={getPlatformCatalogHref(section)}>Перейти в каталог</Link>
        </Button>
      )}
    </div>
  );
}
