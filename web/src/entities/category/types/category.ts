export type Category = {
  id: string;
  name: string;
  slug: string;
  path: string;
  sortOrder: number;
  description?: string;
  parentId?: string;
  image?: Image;
};