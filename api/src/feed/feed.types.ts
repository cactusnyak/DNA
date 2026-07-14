export type FeedScope = 'MARKET' | 'ADS';

export type FeedConfig = {
  sampleSize: number;
  firstCategoryScope: FeedScope;
  categoryRatio: {
    market: number;
    ads: number;
  };
};

export type FeedProductItem = {
  type: 'PRODUCT';
  product: {
    id: string;
    categoryId: string;
    category: {
      id: string;
      name: string;
      slug: string;
      path: string;
      sortOrder: number;
      description?: string;
      parentId?: string;
      image?: {
        id: string;
        url: string;
        sortOrder: number;
        alt?: string | null;
      } | null;
    };
    title: string;
    slug: string;
    description: string;
    price: number;
    createdAt: Date;
    updatedAt: Date;
    images: {
      id: string;
      url: string;
      sortOrder: number;
      alt?: string | null;
    }[];
  };
};

export type FeedAdItem = {
  type: 'AD';
  ad: {
    id: string;
    categoryId: string;
    category?: {
      id: string;
      name: string;
      slug: string;
      path: string;
      sortOrder: number;
      description?: string;
      parentId?: string;
      image?: {
        id: string;
        url: string;
        sortOrder: number;
        alt?: string | null;
      } | null;
    };
    seller?: {
      id: string;
      firstName: string;
      lastName: string;
    };
    title: string;
    slug: string;
    description: string;
    price: number;
    status: string;
    moderatedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    images: {
      id: string;
      url: string;
      sortOrder: number;
      alt?: string | null;
    }[];
  };
};

export type FeedItem = FeedProductItem | FeedAdItem;
