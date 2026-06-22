import type {
  ComponentProps,
  ReactNode,
} from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { cn } from '@/shared/utils/cn';

type StateCardAction =
  | {
      label: ReactNode;
      to: string;
      onClick?: never;
      variant?: ComponentProps<typeof Button>['variant'];
    }
  | {
      label: ReactNode;
      onClick: () => void;
      to?: never;
      variant?: ComponentProps<typeof Button>['variant'];
    };

type StateCardProps = {
  title: ReactNode;
  description: ReactNode;
  action?: StateCardAction;
  className?: string;
};

export function StateCard({
  title,
  description,
  action,
  className,
}: StateCardProps) {
  return (
    <section
      className={cn(
        'mx-auto max-w-xl rounded-3xl border border-border p-6 text-center sm:px-8 sm:py-10',
        className,
      )}
    >
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {description}
        </p>

        {action && (
          <div className="mt-5 flex justify-center">
            {action.to ? (
              <Button asChild variant={action.variant}>
                <Link to={action.to}>{action.label}</Link>
              </Button>
            ) : (
              <Button
                type="button"
                variant={action.variant}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}