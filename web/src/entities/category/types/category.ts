import type { Image } from '@/shared/types/image';

export type Category = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  description?: string;
  parentId?: string;
  image?: Image;
};