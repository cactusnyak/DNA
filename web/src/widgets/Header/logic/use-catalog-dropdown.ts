import { useEffect, useRef, useState } from 'react';

import type { PlatformSectionId } from '@/shared/platform';

export function useCatalogDropdown() {
  const [activeCatalogSection, setActiveCatalogSection] =
    useState<PlatformSectionId | null>(null);

  const isCatalogDropdownOpen = activeCatalogSection !== null;

  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  function openCatalogDropdown(section: PlatformSectionId) {
    setActiveCatalogSection(section);
  }

  function closeCatalogDropdown() {
    setActiveCatalogSection(null);
  }

  function toggleCatalogDropdown(section: PlatformSectionId) {
    setActiveCatalogSection((currentSection) =>
      currentSection === section ? null : section,
    );
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        dropdownContainerRef.current &&
        dropdownContainerRef.current.contains(target)
      ) {
        return;
      }

      closeCatalogDropdown();
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!isCatalogDropdownOpen) {
      document.body.style.overflow = '';
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCatalogDropdownOpen]);

  return {
    activeCatalogSection,
    isCatalogDropdownOpen,
    dropdownContainerRef,
    openCatalogDropdown,
    closeCatalogDropdown,
    toggleCatalogDropdown,
  };
}
