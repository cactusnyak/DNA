import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import {
  getPlatformSection,
  type PlatformSectionId,
} from '@/shared/platform';
import { cn } from '@/shared/utils/cn';
import { GlobalSearch } from '@/widgets/GlobalSearch';

type DesktopHeaderControlsProps = {
  section: PlatformSectionId | null;
  isCatalogDropdownOpen: boolean;
  onCatalogOpen: () => void;
  onNavigate: () => void;
};

export function DesktopHeaderControls({
  section,
  isCatalogDropdownOpen,
  onCatalogOpen,
  onNavigate,
}: DesktopHeaderControlsProps) {
  const sectionConfig = getPlatformSection(section);

  return (
    <div className="hidden flex-1 items-center gap-3 md:flex">
      <GlobalSearch
        section={section}
        placeholder={sectionConfig?.searchPlaceholder ?? 'Поиск по DNA'}
        onOpen={onNavigate}
      />

      {sectionConfig && (
        <Button
          variant="outline"
          type="button"
          asChild
          onMouseEnter={onCatalogOpen}
          className={cn(
            !isCatalogDropdownOpen &&
              'border-foreground bg-foreground text-background hover:bg-foreground hover:text-background',
          )}
        >
          <Link to={sectionConfig.catalogHref} onClick={onNavigate}>
            Каталог
          </Link>
        </Button>
      )}
    </div>
  );
}
