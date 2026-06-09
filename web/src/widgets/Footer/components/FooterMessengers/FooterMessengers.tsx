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
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
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