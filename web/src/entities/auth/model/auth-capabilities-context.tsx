import { type PropsWithChildren } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getAuthConfig } from '../api/get-auth-config';
import type { AuthConfig } from '../types/auth-config';

import {
  AuthCapabilitiesContext,
  type AuthCapabilitiesContextValue,
} from './auth-capabilities-context-value';

const FALLBACK_AUTH_CONFIG: AuthConfig = {
  login: { primaryMethod: 'otp', methods: ['otp'] },
  registration: { primaryMethod: 'otp', methods: ['otp'] },
};

export function AuthCapabilitiesProvider({ children }: PropsWithChildren) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['auth-config'],
    queryFn: getAuthConfig,
    staleTime: Number.POSITIVE_INFINITY,
    retry: 1,
  });

  const config = data ?? FALLBACK_AUTH_CONFIG;

  const value: AuthCapabilitiesContextValue = {
    config,
    isLoading,
    isError,
    isMethodEnabled: (method, operation) =>
      config[operation].methods.includes(method),
  };

  return (
    <AuthCapabilitiesContext.Provider value={value}>
      {children}
    </AuthCapabilitiesContext.Provider>
  );
}
