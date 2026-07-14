export type CreateAdPayload = {
  title: string;
  slug?: string;
  description: string;
  categoryId: string;
  price: number;
  imageUrls: string[];
  contactPhone?: string;
  contactTelegram?: string;
  contactEmail?: string;
  contactOther?: string;
};

export type UpdateAdPayload = CreateAdPayload;
