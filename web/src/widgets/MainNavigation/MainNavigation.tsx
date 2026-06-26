import { useQuery } from '@tanstack/react-query';

import {
  getCurrentUser,
  useAuthStore,
} from '@/entities/auth';

import { DesktopNavigation } from './components/DesktopNavigation';
import { MobileNavigation } from './components/MobileNavigation';
import { getVisibleNavigationItems } from './logic/get-visible-navigation-items';
import type { MainNavigationPlacement } from './types/main-navigation-placement';

type MainNavigationProps = {
  placement: MainNavigationPlacement;
  onNavigate?: () => void;
};

export function MainNavigation({ placement, onNavigate }: MainNavigationProps) {
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    enabled: Boolean(accessToken),
  });

  const visibleNavigationItems = getVisibleNavigationItems(
    accessToken ? currentUser : undefined,
  );

  if (placement === 'mobileBottom') {
    return <MobileNavigation items={visibleNavigationItems} />;
  }

  return (
    <DesktopNavigation
      items={visibleNavigationItems}
      onNavigate={onNavigate}
    />
  );
}