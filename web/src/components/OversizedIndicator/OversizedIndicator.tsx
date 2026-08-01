import { Link, useNavigate } from 'react-router-dom';

import { OVERSIZED_DELIVERY_INFO_HREF } from '@/shared/config/oversized-delivery';

type OversizedIndicatorProps = {
  className?: string;
  renderAsSpan?: boolean;
};

export function OversizedIndicator({
  className = '',
  renderAsSpan = false,
}: OversizedIndicatorProps) {
  const navigate = useNavigate();
  const classNames = `w-fit rounded-sm bg-primary/5 px-2 py-1 text-xs text-primary underline-offset-4 hover:bg-primary/10 ${className}`;

  if (renderAsSpan) {
    const navigateToInformation = () => navigate(OVERSIZED_DELIVERY_INFO_HREF);

    return (
      <span
        role="link"
        tabIndex={0}
        aria-label="Информация о доставке крупногабаритного товара"
        className={classNames}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          navigateToInformation();
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          event.stopPropagation();
          navigateToInformation();
        }}
      >
        Крупногабаритный товар
      </span>
    );
  }

  return (
    <Link
      to={OVERSIZED_DELIVERY_INFO_HREF}
      aria-label="Информация о доставке крупногабаритного товара"
      onClick={(event) => event.stopPropagation()}
      className={classNames}
    >
      Крупногабаритный товар
    </Link>
  );
}
