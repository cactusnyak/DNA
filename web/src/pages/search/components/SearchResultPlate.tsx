import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type SearchResultPlateProps = {
  to: string;
  children: ReactNode;
  meta?: ReactNode;
};

export function SearchResultPlate({
  to,
  children,
  meta,
}: SearchResultPlateProps) {
  return (
    <Link
      to={to}
<<<<<<< HEAD
      className="flex gap-2 rounded-full border border-border/80 bg-background px-2.5 py-1 text-xs hover:border-ring hover:bg-muted"
=======
      className="flex gap-2 rounded-full border border-primary/12 bg-background px-2.5 py-1 text-xs hover:border-ring hover:bg-muted"
>>>>>>> origin/main
    >
      {children}

      {meta && (
        <div className="flex gap-2">
          <div className="size-[2px] self-center rounded-full bg-muted-foreground" />
          <span className="text-xs text-muted-foreground">{meta}</span>
        </div>
      )}
    </Link>
  );
}
