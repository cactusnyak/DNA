import { useContext } from 'react';

import { AuthCapabilitiesContext } from './auth-capabilities-context-value';

export function useAuthCapabilities() {
  const context = useContext(AuthCapabilitiesContext);

  if (!context) {
    throw new Error(
      'useAuthCapabilities must be used within an AuthCapabilitiesProvider',
    );
  }

  return context;
}
