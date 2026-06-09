import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';

function MobileCatalogButton({ className }: { className?: string }) {
  return (
    <Button variant="outline" type="button" className={className} asChild>
      <Link to="/catalog">Каталог</Link>
    </Button>
  );
}

export function MobileHeaderControls() {
  return (
    <div className="border-t border-border/50 px-4 py-3 md:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        <MobileCatalogButton className="shrink-0" />
        <SearchInput placeholder="Поиск" />
      </div>
    </div>
  );
}