import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { cn } from '@/shared/utils/cn';
import { GlobalSearch } from '@/widgets/GlobalSearch';

type DesktopHeaderControlsProps = {
  isCatalogDropdownOpen: boolean;
  onCatalogHover: () => void;
  onNavigate: () => void;
};

export function DesktopHeaderControls({
  isCatalogDropdownOpen,
  onCatalogHover,
  onNavigate,
}: DesktopHeaderControlsProps) {
  return (
    <div className="hidden flex-1 items-center gap-3 md:flex">
      <GlobalSearch
        placeholder="Поиск товаров и разделов"
        onOpen={onNavigate}
      />

      <Button
        variant="outline"
        type="button"
        asChild
        onMouseEnter={onCatalogHover}
        className={cn(
          !isCatalogDropdownOpen &&
            'border-foreground bg-foreground text-background hover:bg-foreground hover:text-background',
        )}
      >
        <Link to="/catalog" onClick={onNavigate}>
          Каталог
        </Link>
      </Button>
    </div>
  );
}