import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import {
  PLATFORM_SECTION,
  getPlatformSection,
  platformSections,
  type PlatformSectionId,
} from '@/shared/platform';
import { cn } from '@/shared/utils/cn';
import { GlobalSearch } from '@/widgets/GlobalSearch';

type DesktopHeaderControlsProps = {
  section: PlatformSectionId | null;
  activeCatalogSection: PlatformSectionId | null;
  isCatalogDropdownOpen: boolean;
  onCatalogOpen: (section: PlatformSectionId) => void;
  onNavigate: () => void;
};

function CatalogButton({
  to,
  label,
  isActive,
  onMouseEnter,
  onClick,
}: {
  to: string;
  label: string;
  isActive?: boolean;
  onMouseEnter?: () => void;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="outline"
      type="button"
      asChild
      onMouseEnter={onMouseEnter}
      className={cn(
        isActive &&
          'border-foreground bg-foreground text-background hover:bg-foreground hover:text-background',
      )}
    >
      <Link to={to} onClick={onClick}>
        {label}
      </Link>
    </Button>
  );
}

export function DesktopHeaderControls({
  section,
  activeCatalogSection,
  isCatalogDropdownOpen,
  onCatalogOpen,
  onNavigate,
}: DesktopHeaderControlsProps) {
  const sectionConfig = getPlatformSection(section);

  return (
    <div className="hidden flex-1 items-center gap-3 md:flex">
      {sectionConfig ? (
        <CatalogButton
          to={sectionConfig.catalogHref}
          label={sectionConfig.catalogLabel}
          isActive={
            isCatalogDropdownOpen && activeCatalogSection === sectionConfig.id
          }
          onMouseEnter={() => onCatalogOpen(sectionConfig.id)}
          onClick={onNavigate}
        />
      ) : (
        <>
          <CatalogButton
            to={platformSections[PLATFORM_SECTION.ADS].catalogHref}
            label={platformSections[PLATFORM_SECTION.ADS].catalogLabel}
            isActive={
              isCatalogDropdownOpen && activeCatalogSection === PLATFORM_SECTION.ADS
            }
            onMouseEnter={() => onCatalogOpen(PLATFORM_SECTION.ADS)}
            onClick={onNavigate}
          />
          <CatalogButton
            to={platformSections[PLATFORM_SECTION.MARKET].catalogHref}
            label={platformSections[PLATFORM_SECTION.MARKET].catalogLabel}
            isActive={
              isCatalogDropdownOpen && activeCatalogSection === PLATFORM_SECTION.MARKET
            }
            onMouseEnter={() => onCatalogOpen(PLATFORM_SECTION.MARKET)}
            onClick={onNavigate}
          />
        </>
      )}

      <GlobalSearch
        placeholder={sectionConfig?.searchPlaceholder ?? 'Поиск по DNA'}
        onOpen={onNavigate}
      />
    </div>
  );
}
