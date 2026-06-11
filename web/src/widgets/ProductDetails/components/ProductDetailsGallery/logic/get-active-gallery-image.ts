import type { Image } from '@/shared/types/image';

export function getActiveGalleryImage(images: Image[], activeIndex: number) {
  return images[activeIndex] ?? images[0];
}