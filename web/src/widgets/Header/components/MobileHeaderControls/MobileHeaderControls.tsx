import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import {
  PLATFORM_SECTION,
  getPlatformSection,
  platformSections,
  type PlatformSectionId,
} from '@/shared/platform';
import { GlobalSearch } from '@/widgets/GlobalSearch';

function MobileCatalogButton({
  to,
  label,
  className,
}: {
  to: string;
  label: string;
  className?: string;
}) {
  return (
    <Button variant="outline" type="button" className={className} asChild>
      <Link to={to}>{label}</Link>
    </Button>
  );
}

type MobileHeaderControlsProps = {
  section: PlatformSectionId | null;
};

export function MobileHeaderControls({ section }: MobileHeaderControlsProps) {
  const sectionConfig = getPlatformSection(section);

  return (
    <div className="border-t border-border/50 px-4 py-3 md:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        {sectionConfig ? (
          <MobileCatalogButton
            to={sectionConfig.catalogHref}
            label={sectionConfig.catalogLabel}
            className="shrink-0"
          />
        ) : (
          <>
            <MobileCatalogButton
              to={platformSections[PLATFORM_SECTION.ADS].catalogHref}
              label={platformSections[PLATFORM_SECTION.ADS].catalogLabel}
              className="shrink-0"
            />
            <MobileCatalogButton
              to={platformSections[PLATFORM_SECTION.MARKET].catalogHref}
              label={platformSections[PLATFORM_SECTION.MARKET].catalogLabel}
              className="shrink-0"
            />
          </>
        )}

        <GlobalSearch
          placeholder={sectionConfig?.searchPlaceholder ?? 'Поиск по DNA'}
          className="min-w-0 flex-1"
        />
      </div>
    </div>
  );
}
