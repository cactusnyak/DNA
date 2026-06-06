import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CatalogDropdown } from '@/widgets/CatalogDropdown';
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

function MobileCatalogButton({ className }: { className?: string }) {
  return (
    <Button variant="outline" type="button" className={className} asChild>
      <Link to="/catalog">Каталог</Link>
    </Button>
  );
}

export function Header() {
  const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);

  function openCatalogDropdown() {
    setIsCatalogDropdownOpen(true);
  }

  function closeCatalogDropdown() {
    setIsCatalogDropdownOpen(false);
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-background"
      onMouseLeave={closeCatalogDropdown}
    >
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-8 px-4 py-6">
        <Link to="/" className="flex shrink-0 items-center">
          <LogoMain className="h-6 w-auto" aria-label="DNA" />
        </Link>

        <div className="hidden flex-1 items-center gap-3 md:flex">
          <SearchField placeholder="Поиск товаров" />

          <Button
            variant="outline"
            type="button"
            asChild
            onMouseEnter={openCatalogDropdown}
          >
            <Link to="/catalog">Каталог</Link>
          </Button>
        </div>

        <MainNavigation placement="header" />
      </div>

      {isCatalogDropdownOpen && (
        <div
          className="absolute top-full right-0 left-0 hidden px-4 pb-4 md:block"
          onMouseEnter={openCatalogDropdown}
        >
          <div className="mx-auto max-w-7xl">
            <CatalogDropdown onClose={closeCatalogDropdown} />
          </div>
        </div>
      )}

      <div className="border-t border-border px-4 py-3 md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-2">
          <MobileCatalogButton className="shrink-0" />
          <SearchField placeholder="Поиск" />
        </div>
      </div>
    </header>
  );
}