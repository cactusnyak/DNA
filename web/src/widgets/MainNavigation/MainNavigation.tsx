import { DesktopNavigation } from './components/DesktopNavigation';
import { MobileNavigation } from './components/MobileNavigation';

import type { MainNavigationPlacement } from './types/main-navigation-placement';

type MainNavigationProps = {
  placement: MainNavigationPlacement;
};

export function MainNavigation({
  placement,
}: MainNavigationProps) {
  if (placement === 'mobileBottom') {
    return <MobileNavigation />;
  }

  return <DesktopNavigation />;
}