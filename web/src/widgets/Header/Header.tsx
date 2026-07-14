import { useEffect } from 'react';

import { MainNavigation } from '@/widgets/MainNavigation/MainNavigation';
import { useActivePlatformSection } from '@/shared/platform';

import { DesktopHeaderControls } from './components/DesktopHeaderControls';
import { HeaderCatalogDropdown } from './components/HeaderCatalogDropdown';
import { HeaderLogo } from './components/HeaderLogo';
import { MobileHeaderControls } from './components/MobileHeaderControls';
import { PlatformSectionSwitcher } from './components/PlatformSectionSwitcher';
import { useCatalogDropdown } from './logic/use-catalog-dropdown';
import { useScrollHide } from './logic/use-scroll-hide';

export function Header() {
  const { activeSectionId } = useActivePlatformSection();

  const {
    isCatalogDropdownOpen,
    dropdownContainerRef,
    closeCatalogDropdown,
    openCatalogDropdown,
  } = useCatalogDropdown();

  const { isHidden } = useScrollHide({ threshold: 80 });

  useEffect(() => {
    const el = dropdownContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--header-height', `${el.offsetHeight}px`);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [dropdownContainerRef]);

  return (
    <header
      ref={dropdownContainerRef}
      className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl w-full transition-transform duration-300 ease-in-out"
      style={{ transform: isHidden ? 'translateY(-100%)' : 'translateY(0)' }}
      onMouseLeave={closeCatalogDropdown}
    >
      <div className="w-full border-b border-border/50">
        <div className="mx-auto flex max-w-7xl min-h-16 w-full items-center gap-4 p-4 lg:gap-8">
          <HeaderLogo onClick={closeCatalogDropdown} />

          <PlatformSectionSwitcher activeSectionId={activeSectionId} />

          <DesktopHeaderControls
            section={activeSectionId}
            isCatalogDropdownOpen={isCatalogDropdownOpen}
            onCatalogOpen={openCatalogDropdown}
            onNavigate={closeCatalogDropdown}
          />
        </div>
      </div>

      <div className="w-full hidden md:block">
        <div className="flex justify-center mx-auto w-full p-2">
          <MainNavigation placement="header" onNavigate={closeCatalogDropdown} />
        </div>
      </div>

      {isCatalogDropdownOpen && activeSectionId && (
        <HeaderCatalogDropdown
          section={activeSectionId}
          onClose={closeCatalogDropdown}
        />
      )}

      <MobileHeaderControls section={activeSectionId} />
    </header>
  );
}
