import { useEffect, useState } from 'react';

import type { ItemGridDensity } from '@/shared/utils/get-item-grid-classes';

const GRID_COLUMNS: Record<ItemGridDensity, { sm: number; md: number; lg: number; xl2: number }> = {
  default: { sm: 2, md: 3, lg: 5, xl2: 6 },
  compact: { sm: 2, md: 3, lg: 4, xl2: 4 },
};

const MD_BREAKPOINT = 768;
const LG_BREAKPOINT = 1024;
const XL2_BREAKPOINT = 1536;

function getColumns(width: number, density: ItemGridDensity): number {
  const cols = GRID_COLUMNS[density];

  if (width >= XL2_BREAKPOINT) return cols.xl2;
  if (width >= LG_BREAKPOINT) return cols.lg;
  if (width >= MD_BREAKPOINT) return cols.md;
  return cols.sm;
}

export function useGridColumns(density: ItemGridDensity = 'default'): number {
  const [columns, setColumns] = useState(() =>
    getColumns(window.innerWidth, density),
  );

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setColumns(getColumns(window.innerWidth, density));
    });

    observer.observe(document.documentElement);

    return () => observer.disconnect();
  }, [density]);

  return columns;
}
