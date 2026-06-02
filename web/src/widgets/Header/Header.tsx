import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MainNavigation } from '@/widgets/MainNavigation/MainNavigation';

import LogoMain from '@/assets/logo/logo-main.svg?react';

function SearchField({ placeholder }: { placeholder: string }) {
  return (
    <label className="flex h-8 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      <Search className="size-4 text-muted-foreground" />

      <input
        type="search"
        placeholder={placeholder}
        className="h-full w-full border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}

function CatalogButton({ className }: { className?: string }) {
  return (
    <Button variant="outline" type="button" className={className} asChild>
      <Link to="/catalog">Каталог</Link>
    </Button>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-8 px-4 py-6">
        <Link to="/" className="flex shrink-0 items-center">
          <LogoMain className="h-6 w-auto" aria-label="DNA" />
        </Link>

        <div className="hidden flex-1 items-center gap-3 md:flex">
          <SearchField placeholder="Поиск товаров" />
          <CatalogButton />
        </div>

        <MainNavigation placement="header" />
      </div>

      <div className="border-t border-border px-4 py-3 md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-2">
          <CatalogButton className="shrink-0" />
          <SearchField placeholder="Поиск" />
        </div>
      </div>
    </header>
  );
}