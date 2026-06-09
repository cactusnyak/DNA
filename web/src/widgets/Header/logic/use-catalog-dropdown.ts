import { useEffect, useRef, useState } from 'react';

export function useCatalogDropdown() {
  const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);

  const dropdownContainerRef = useRef<HTMLDivElement>(null);

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
    isCatalogDropdownOpen,
    dropdownContainerRef,
    closeCatalogDropdown,
    toggleCatalogDropdown,
  };
}