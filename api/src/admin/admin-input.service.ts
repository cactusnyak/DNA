import { BadRequestException, Injectable } from '@nestjs/common';
import { CatalogCollectionType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

const CYRILLIC_MAP: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'c',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

type SlugEntity =
  | 'marketCategory'
  | 'product'
  | 'collection'
  | 'adCategory'
  | 'ad';

@Injectable()
export class AdminInputService {
  constructor(private readonly prismaService: PrismaService) {}

  getObjectBody(body: unknown) {
    return body && typeof body === 'object'
      ? (body as Record<string, unknown>)
      : {};
  }

  getRequiredString(value: unknown, message: string) {
    const result = this.getOptionalString(value);

    if (!result) {
      throw new BadRequestException(message);
    }

    return result;
  }

  getOptionalString(value: unknown) {
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmedValue = value.trim();

    return trimmedValue || undefined;
  }

  getNumber(value: unknown, fallback: number) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const parsedValue = Number(value);

      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }

    return fallback;
  }

  getBoolean(value: unknown, fallback: boolean) {
    return typeof value === 'boolean' ? value : fallback;
  }

  getCollectionType(value: unknown) {
    return value === CatalogCollectionType.PRODUCT
      ? CatalogCollectionType.PRODUCT
      : CatalogCollectionType.CATEGORY;
  }

  getImageUrls(payload: Record<string, unknown>) {
    if (Array.isArray(payload.imageUrls)) {
      return payload.imageUrls
        .map((value) => this.getOptionalString(value))
        .filter(Boolean) as string[];
    }

    const imageUrlsText = this.getOptionalString(payload.imageUrls);

    return imageUrlsText
      ? imageUrlsText
          .split('\n')
          .map((value) => value.trim())
          .filter(Boolean)
      : [];
  }

  getIdsFromBody(body: unknown): string[] {
    const payload = this.getObjectBody(body);

    if (!Array.isArray(payload.ids)) {
      throw new BadRequestException('ids must be an array of strings');
    }

    const ids = payload.ids.filter((id) => typeof id === 'string' && id.trim());

    if (!ids.length) {
      throw new BadRequestException('ids array must not be empty');
    }

    return ids as string[];
  }

  async getUniqueSlug(params: {
    entity: SlugEntity;
    value: unknown;
    fallback: string;
    exceptId?: string;
  }) {
    const baseSlug = this.slugify(
      this.getOptionalString(params.value) ?? params.fallback,
    );
    let slug = baseSlug;
    let counter = 1;

    while (await this.isSlugBusy(params.entity, slug, params.exceptId)) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return slug;
  }

  private async isSlugBusy(entity: SlugEntity, slug: string, exceptId?: string) {
    const id = exceptId ? { not: exceptId } : undefined;

    if (entity === 'marketCategory') {
      return Boolean(
        await this.prismaService.marketCategory.findFirst({
          where: { slug, deletedAt: null, id },
        }),
      );
    }

    if (entity === 'product') {
      return Boolean(
        await this.prismaService.product.findFirst({
          where: { slug, deletedAt: null, id },
        }),
      );
    }

    if (entity === 'adCategory') {
      return Boolean(
        await this.prismaService.adCategory.findFirst({
          where: { slug, deletedAt: null, id },
        }),
      );
    }

    if (entity === 'ad') {
      return Boolean(
        await this.prismaService.ad.findFirst({
          where: { slug, deletedAt: null, id },
        }),
      );
    }

    return Boolean(
      await this.prismaService.catalogCollection.findFirst({
        where: { slug, id },
      }),
    );
  }

  private slugify(value: string) {
    const transliteratedValue = value
      .toLowerCase()
      .split('')
      .map((char) => CYRILLIC_MAP[char] ?? char)
      .join('');

    return (
      transliteratedValue
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || 'item'
    );
  }
}
