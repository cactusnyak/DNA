import { MainNavigation } from '@/widgets/MainNavigation/MainNavigation';

import { DesktopHeaderControls } from './components/DesktopHeaderControls';
import { HeaderCatalogDropdown } from './components/HeaderCatalogDropdown';
import { HeaderLogo } from './components/HeaderLogo';
import { MobileHeaderControls } from './components/MobileHeaderControls';
import { useCatalogDropdown } from './logic/use-catalog-dropdown';

export function Header() {
  const {
    isCatalogDropdownOpen,
    dropdownContainerRef,
    closeCatalogDropdown,
    toggleCatalogDropdown,
  } = useCatalogDropdown();

  return (
    <header
      ref={dropdownContainerRef}
      className="
        sticky top-0 z-40
        border-b border-border/50
        bg-background/70
        backdrop-blur-xl
      "
      onMouseLeave={closeCatalogDropdown}
    >
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-8 px-4 py-6">
        <HeaderLogo />

        <DesktopHeaderControls onCatalogHover={toggleCatalogDropdown} />

        <MainNavigation placement="header" />
      </div>

      {isCatalogDropdownOpen && (
        <HeaderCatalogDropdown onClose={closeCatalogDropdown} />
      )}

      <MobileHeaderControls />
    </header>
  );
}