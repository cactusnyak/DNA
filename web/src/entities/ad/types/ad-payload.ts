import type { Location } from '@/shared/types/location';
import type { ContentDescription } from '@/shared/types/content-description';

export type CreateAdPayload = {
  title: string;
  slug?: string;
  description: ContentDescription;
  categoryId: string;
  price: number;
  location?: Location;
  imageUrls: string[];
  contactPhone?: string;
  contactTelegram?: string;
  contactEmail?: string;
  contactOther?: string;
};

export type UpdateAdPayload = CreateAdPayload;
