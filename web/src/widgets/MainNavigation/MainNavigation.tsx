import { DesktopNavigation } from './components/DesktopNavigation';
import { MobileNavigation } from './components/MobileNavigation';

import type { MainNavigationPlacement } from './types/main-navigation-placement';

type MainNavigationProps = {
  placement: MainNavigationPlacement;
  onNavigate?: () => void;
};

export function MainNavigation({ placement, onNavigate }: MainNavigationProps) {
  if (placement === 'mobileBottom') {
    return <MobileNavigation />;
  }

  return <DesktopNavigation onNavigate={onNavigate} />;
}