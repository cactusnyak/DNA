import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

import { ArrowRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

type SectionTitleProps = {
  title: string;
  href?: string;
  onClick?: () => void;
  level?: 2 | 3;
  className?: string;
  arrowClassName?: string;
};

export const SectionTitle = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  SectionTitleProps
>(
  (
    { title, href, onClick, level = 2, className, arrowClassName },
    ref,
  ) => {
    const baseClasses =
      'group flex items-center gap-2 font-semibold hover:text-primary transition-colors cursor-pointer';
    const titleClasses = cn(
      baseClasses,
      level === 2 ? 'text-lg' : 'text-base',
      className,
    );
    const arrowClasses = cn(
      'size-4 transition-transform group-hover:translate-x-1',
      arrowClassName,
    );

    const HeadingTag = level === 2 ? 'h2' : 'h3';

    const content = (
      <>
        <HeadingTag className="truncate">{title}</HeadingTag>
        <ArrowRight className={arrowClasses} aria-hidden="true" />
      </>
    );

    if (href) {
      return (
        <Link
          ref={ref as React.RefObject<HTMLAnchorElement>}
          to={href}
          className={titleClasses}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        onClick={onClick}
        className={titleClasses}
        type="button"
      >
        {content}
      </button>
    );
  },
);

SectionTitle.displayName = 'SectionTitle';
