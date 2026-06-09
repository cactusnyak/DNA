import { Link } from 'react-router-dom';

import LogoMain from '@/assets/logos/dna/logo-main.svg?react';

type HeaderLogoProps = {
  onClick?: () => void;
};

export function HeaderLogo({ onClick }: HeaderLogoProps) {
  return (
    <Link to="/" onClick={onClick} className="flex shrink-0 items-center">
      <LogoMain className="h-6 w-auto" aria-label="DNA" />
    </Link>
  );
}