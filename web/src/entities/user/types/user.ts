import type { Image } from '@/shared/types/image';

import type { UserRole } from './user-role';

export type User = {
  id: string;
  email: string;
  firstName: string
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  patronymic?: string;
  phone?: string;
  avatar?: Image;
  referralCode?: string;
};