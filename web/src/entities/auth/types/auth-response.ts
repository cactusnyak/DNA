import type { User } from '@/entities/user';

export type AuthResponse = {
  user: User;
  accessToken: string;
};