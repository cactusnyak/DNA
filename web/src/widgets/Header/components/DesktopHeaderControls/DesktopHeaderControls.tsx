import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';

type DesktopHeaderControlsProps = {
  onCatalogHover: () => void;
};

export function DesktopHeaderControls({
  onCatalogHover,
}: DesktopHeaderControlsProps) {
  return (
    <div className="hidden flex-1 items-center gap-3 md:flex">
      <SearchInput placeholder="Поиск товаров" />

      <Button
        variant="outline"
        type="button"
        asChild
        onMouseEnter={onCatalogHover}
      >
        <Link to="/catalog">Каталог</Link>
      </Button>
    </div>
  );
}