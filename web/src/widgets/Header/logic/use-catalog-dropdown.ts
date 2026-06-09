import { useEffect, useRef, useState } from 'react';

export function useCatalogDropdown() {
  const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);

  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  function openCatalogDropdown() {
    setIsCatalogDropdownOpen(true);
  }

  function closeCatalogDropdown() {
    setIsCatalogDropdownOpen(false);
  }

  function toggleCatalogDropdown() {
    setIsCatalogDropdownOpen((isOpen) => !isOpen);
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

  return {
    isCatalogDropdownOpen,
    dropdownContainerRef,
    openCatalogDropdown,
    closeCatalogDropdown,
    toggleCatalogDropdown,
  };
}