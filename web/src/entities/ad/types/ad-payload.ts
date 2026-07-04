export type CreateAdPayload = {
  title: string;
  slug?: string;
  description: string;
  categoryId: string;
  price: number;
  imageUrls: string[];
};

export type UpdateAdPayload = CreateAdPayload;
