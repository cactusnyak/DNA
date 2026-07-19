import type { ComponentType, SVGProps } from 'react';

import { Google, Yandex } from '@thesvg/react';

import type { OAuthProvider } from '@/entities/auth';

export type OAuthProviderItem = {
  id: OAuthProvider;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const oauthProviderItems: OAuthProviderItem[] = [
  {
    id: 'google',
    label: 'Google',
    icon: Google,
  },
  {
    id: 'yandex',
    label: 'Yandex',
    icon: Yandex,
  },
];
