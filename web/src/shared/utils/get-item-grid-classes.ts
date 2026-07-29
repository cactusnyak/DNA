export type ItemGridDensity = 'default' | 'compact';

export function getItemGridClasses(density: ItemGridDensity = 'default') {
  const base = `grid gap-[5px] grid-cols-2 md:grid-cols-5 bg-white/10 backdrop-blur-[1px]`;

  if (density === 'compact') {
    return `${base} lg:grid-cols-4 2xl:grid-cols-4`;
  }

  return `${base} lg:grid-cols-5 2xl:grid-cols-6`;
}
