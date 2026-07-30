import type { ComponentProps } from 'react';

import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  [
    'group/button inline-flex shrink-0 cursor-pointer select-none items-center justify-center',
    'whitespace-nowrap rounded-lg bg-clip-padding text-sm font-medium',
    'outline-none',
    'active:not-aria-[haspopup]:translate-y-px',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
    'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    "[&_svg:not([class*='size-'])]:size-4",
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          '',

        outline:
          'border border-primary/15 bg-primary/5 text-primary hover:bg-primary/10 hover:text-foreground aria-expanded:bg-primary/10 aria-expanded:text-foreground',

        secondary:
          'bg-primary/5 text-primary hover:bg-primary/10 aria-expanded:bg-primary/10 aria-expanded:text-foreground',

        accent:
          'bg-primary text-primary-foreground hover:bg-primary/80 aria-expanded:bg-primary/80',

        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',

        warning:
          'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 focus-visible:border-amber-500/40 focus-visible:ring-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25 dark:focus-visible:ring-amber-500/35',

        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',

        link:
          'text-primary underline-offset-4 hover:underline',
      },

      size: {
        default:
          'h-8 gap-1.5 px-4 has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3',

        xs:
          "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-3 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5 [&_svg:not([class*='size-'])]:size-3",

        sm:
          "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-3.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3 [&_svg:not([class*='size-'])]:size-3.5",

        lg:
          'h-9 gap-1.5 px-5 has-data-[icon=inline-start]:pl-4 has-data-[icon=inline-end]:pr-4',

        icon:
          'size-8',

        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",

        'icon-sm':
          'size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg',

        'icon-lg':
          'size-9',
      },
    },

    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot.Root : 'button';

  return (
    <Component
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={buttonVariants({
        variant,
        size,
        className,
      })}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
