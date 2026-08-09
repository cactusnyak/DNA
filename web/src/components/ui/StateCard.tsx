import type {
  ComponentProps,
  ComponentType,
  ReactNode,
} from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

type StateCardIcon = ComponentType<{
  className?: string;
  strokeWidth?: number;
}>;

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
  icon?: StateCardIcon;
  iconClassName?: string;
  title: ReactNode;
  description: ReactNode;
  action?: StateCardAction;
  actions?: StateCardAction[];
  className?: string;
};

export function StateCard({
  icon: Icon,
  iconClassName,
  title,
  description,
  action,
  actions,
  className,
}: StateCardProps) {
  const cardActions = actions ?? (action ? [action] : []);

  return (
    <section
      className={[
        'mx-auto max-w-xl rounded-3xl p-6 text-center shadow-card-2xl bg-white sm:px-8 sm:py-10',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="flex flex-col gap-6">
        {Icon && (
          <span className="p-3 shadow-card-md rounded-xl bg-white mx-auto flex items-center justify-center">
            <Icon
              className={['size-8', iconClassName ?? 'text-primary'].join(' ')}
              strokeWidth={1.5}
            />
          </span>
        )}

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>

          <div className="text-sm leading-6 text-muted-foreground">
            {description}
          </div>
        </div>

        {cardActions.length > 0 && (
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            {cardActions.map((cardAction, index) =>
              cardAction.to ? (
                <Button
                  key={index}
                  asChild
                  variant={cardAction.variant ?? 'accent'}
                >
                  <Link to={cardAction.to}>{cardAction.label}</Link>
                </Button>
              ) : (
                <Button
                  key={index}
                  type="button"
                  variant={cardAction.variant ?? 'accent'}
                  onClick={cardAction.onClick}
                >
                  {cardAction.label}
                </Button>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}
