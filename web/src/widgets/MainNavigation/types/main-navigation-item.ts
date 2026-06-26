import type { LucideIcon } from 'lucide-react';

import type { UserRole } from '@/entities/user';

export type MainNavigationItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  allowedRoles?: UserRole[];
};