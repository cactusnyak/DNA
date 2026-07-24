import {
  getPlatformSection,
  type PlatformSectionId,
} from '@/shared/platform';
import { GlobalSearch } from '@/widgets/GlobalSearch';

type MobileHeaderControlsProps = {
  section: PlatformSectionId | null;
};

export function MobileHeaderControls({ section }: MobileHeaderControlsProps) {
  const sectionConfig = getPlatformSection(section);

  return (
    <div className="border-t border-border/50 px-2 py-2 sm:px-3 md:hidden">
      <div className="mx-auto flex max-w-7xl">
        <GlobalSearch
          placeholder={sectionConfig?.searchPlaceholder ?? 'Поиск по DNA'}
          className="min-w-0 flex-1"
        />
      </div>
    </div>
  );
}
