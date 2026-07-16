const GAP_CLASS = 'gap-[3px]';

export type ItemGridDensity = 'default' | 'compact';

export function getItemGridClasses(density: ItemGridDensity = 'default') {
  const base = `grid ${GAP_CLASS} grid-cols-2 md:grid-cols-3`;

  if (density === 'compact') {
    return `${base} lg:grid-cols-4 2xl:grid-cols-4`;
  }

  return `${base} lg:grid-cols-5 2xl:grid-cols-6`;
}
