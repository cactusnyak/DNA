import type { User } from '@/entities/user';

import { navigationItems } from '../data/navigation-items';

export function getVisibleNavigationItems(user?: User) {
  return navigationItems.filter((item) => {
    if (!item.allowedRoles?.length) {
      return true;
    }

    if (!user) {
      return false;
    }

    return item.allowedRoles.includes(user.role);
  });
}