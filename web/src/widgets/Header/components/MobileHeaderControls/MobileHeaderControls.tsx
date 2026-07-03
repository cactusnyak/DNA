import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import {
  DEFAULT_PLATFORM_SECTION_ID,
  getPlatformSection,
  type PlatformSectionId,
} from '@/shared/platform';
import { GlobalSearch } from '@/widgets/GlobalSearch';

function MobileCatalogButton({
  section,
  className,
}: {
  section: PlatformSectionId;
  className?: string;
}) {
  const sectionConfig = getPlatformSection(section);

  return (
    <Button variant="outline" type="button" className={className} asChild>
      <Link to={sectionConfig.catalogHref}>Каталог</Link>
    </Button>
  );
}

type MobileHeaderControlsProps = {
  section?: PlatformSectionId;
};

export function MobileHeaderControls({
  section = DEFAULT_PLATFORM_SECTION_ID,
}: MobileHeaderControlsProps) {
  const sectionConfig = getPlatformSection(section);

  return (
    <div className="border-t border-border/50 px-4 py-3 md:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        <MobileCatalogButton section={section} className="shrink-0" />

        <GlobalSearch
          section={section}
          placeholder={sectionConfig.searchPlaceholder}
          className="min-w-0 flex-1"
        />
      </div>
    </div>
  );
}
