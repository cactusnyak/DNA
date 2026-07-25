import type { MarketCategory } from '@/entities/market-category';
import type { Image } from '@/shared/types/image';
import type { Location } from '@/shared/types/location';

export type BooleanProductAddition = {
  id: string;
  type: 'boolean';
  title: string;
  price: number;
  required: boolean;
  defaultValue: boolean | null;
};

export type QuantityProductAddition = {
  id: string;
  type: 'quantity';
  title: string;
  price: number;
  required: boolean;
  defaultValue: number | null;
  min: number;
  max: number | null;
  unitLabel: string;
};

export type ProductAddition = BooleanProductAddition | QuantityProductAddition;

export type SelectedProductAddition =
  | { additionId: string; type: 'boolean'; value: boolean }
  | { additionId: string; type: 'quantity'; value: number };

export type Product = {
  id: string;
  category: MarketCategory;
  title: string;
  slug: string;
  description: string;
  price: number;
  location?: Location | null;
  additions: ProductAddition[];
  createdAt: string;
  updatedAt: string;
  images: Image[];
};
