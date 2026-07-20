import type { ComponentType, SVGProps } from 'react';

import { Yandex } from '@thesvg/react';

import type { OAuthProvider } from '@/entities/auth';

export type OAuthProviderItem = {
  id: OAuthProvider;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const oauthProviderItems: OAuthProviderItem[] = [
  {
    id: 'yandex',
    label: 'Yandex',
    icon: Yandex,
  },
];
