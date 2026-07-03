import { MainNavigation } from '@/widgets/MainNavigation/MainNavigation';
import { useActivePlatformSection } from '@/shared/platform';

import { DesktopHeaderControls } from './components/DesktopHeaderControls';
import { HeaderCatalogDropdown } from './components/HeaderCatalogDropdown';
import { HeaderLogo } from './components/HeaderLogo';
import { MobileHeaderControls } from './components/MobileHeaderControls';
import { PlatformSectionSwitcher } from './components/PlatformSectionSwitcher';
import { useCatalogDropdown } from './logic/use-catalog-dropdown';

export function Header() {
  const activeSection = useActivePlatformSection();

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
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-4 px-4 py-6 lg:gap-8">
        <HeaderLogo onClick={closeCatalogDropdown} />

        <PlatformSectionSwitcher
          activeSectionId={activeSection.id}
          onNavigate={closeCatalogDropdown}
        />

        <DesktopHeaderControls
          section={activeSection.id}
          isCatalogDropdownOpen={isCatalogDropdownOpen}
          onCatalogHover={toggleCatalogDropdown}
          onNavigate={closeCatalogDropdown}
        />

        <MainNavigation placement="header" onNavigate={closeCatalogDropdown} />
      </div>

      {isCatalogDropdownOpen && (
        <HeaderCatalogDropdown
          section={activeSection.id}
          onClose={closeCatalogDropdown}
        />
      )}

      <MobileHeaderControls section={activeSection.id} />
    </header>
  );
}
