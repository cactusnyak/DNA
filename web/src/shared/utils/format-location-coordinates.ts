import type { Location } from '@/shared/types/location';

export function formatLocationCoordinates(location?: Location | null) {
  if (!location) return '—';

  return `${location.coordinates.latitude}, ${location.coordinates.longitude}`;
}
