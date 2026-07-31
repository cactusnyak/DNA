import { createContext } from 'react';

import type { AuthConfig, AuthMethod } from '../types/auth-config';

export type AuthCapabilitiesContextValue = {
  config: AuthConfig;
  isLoading: boolean;
  isError: boolean;
  isMethodEnabled: (method: AuthMethod, operation: 'login' | 'registration') => boolean;
};

export const AuthCapabilitiesContext =
  createContext<AuthCapabilitiesContextValue | undefined>(undefined);
