import {
  platformSectionList,
  type PlatformSectionId,
} from '@/shared/platform';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

type PlatformSectionSwitcherProps = {
  activeSectionId: PlatformSectionId | null;
};

export function PlatformSectionSwitcher({
  activeSectionId,
}: PlatformSectionSwitcherProps) {
  const options = platformSectionList.map((section) => ({
    value: section.id,
    label: section.label,
    href: section.href,
  }));

  return (
    <SegmentedControl
      options={options}
      value={activeSectionId ?? ''}
      className="shrink-0"
    />
  );
}
