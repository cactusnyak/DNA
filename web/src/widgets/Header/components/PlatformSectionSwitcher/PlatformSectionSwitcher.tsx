import { Link } from 'react-router-dom';

import {
  platformSectionList,
  type PlatformSectionId,
} from '@/shared/platform';
import { cn } from '@/shared/utils/cn';

type PlatformSectionSwitcherProps = {
  activeSectionId: PlatformSectionId | null;
  onNavigate?: () => void;
};

export function PlatformSectionSwitcher({
  activeSectionId,
  onNavigate,
}: PlatformSectionSwitcherProps) {
  return (
    <nav className="flex shrink-0 items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
      {platformSectionList.map((section) => {
        const isActive = section.id === activeSectionId;

        return (
          <Link
            key={section.id}
            to={section.href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:bg-background hover:text-foreground',
            )}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
