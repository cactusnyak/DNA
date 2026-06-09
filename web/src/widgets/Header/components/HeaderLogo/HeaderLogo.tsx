import { Link } from 'react-router-dom';

import LogoMain from '@/assets/logos/dna/logo-main.svg?react';

export function HeaderLogo() {
  return (
    <Link to="/" className="flex shrink-0 items-center">
      <LogoMain className="h-6 w-auto" aria-label="DNA" />
    </Link>
  );
}