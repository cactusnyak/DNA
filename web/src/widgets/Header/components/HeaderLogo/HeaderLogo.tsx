import { Link } from 'react-router-dom';

import { BrandLogo } from '@/components/ui/BrandLogo';

type HeaderLogoProps = {
  onClick?: () => void;
};

export function HeaderLogo({ onClick }: HeaderLogoProps) {
  return (
    <Link to="/" onClick={onClick} className="flex shrink-0 items-center">
      <BrandLogo />
    </Link>
  );
}
