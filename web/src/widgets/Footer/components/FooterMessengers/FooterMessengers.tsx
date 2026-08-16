type MessengerLink = {
  label: string;
  href: string;
  logo: string;
};

type FooterMessengersProps = {
  links: MessengerLink[];
};

export function FooterMessengers({ links }: FooterMessengersProps) {
  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Мессенджеры
      </p>

      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
<<<<<<< HEAD
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background px-3 py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground"
=======
            className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-background px-3 py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground"
>>>>>>> origin/main
          >
            <img
              src={link.logo}
              alt={link.label}
              className="size-4 object-contain"
            />

            <span>{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
