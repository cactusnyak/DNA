import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { AdsModerationService } from './ads-moderation.service';
import type { CreateAdDto } from './dto/create-ad.dto';
import type { UpdateAdDto } from './dto/update-ad.dto';

type FindAllAdsParams = {
  categorySlug?: string;
  priceFrom?: number;
  priceTo?: number;
  categoryIds?: string[];
  sort?: string;
};

type AdSortField = 'title' | 'category' | 'createdAt' | 'price';
type AdSortDirection = 'asc' | 'desc';

const CYRILLIC_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
  з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c',
  ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

const ACTIVE_AD_CATEGORY_WHERE = {
  isActive: true,
  deletedAt: null,
};

const PUBLISHED_AD_WHERE = {
  isActive: true,
  deletedAt: null,
  status: AdStatus.PUBLISHED,
};

const SORT_FIELD_WHITELIST = new Set<AdSortField>([
  'title',
  'category',
  'createdAt',
  'price',
]);

const SORT_DIRECTION_WHITELIST = new Set<AdSortDirection>(['asc', 'desc']);

@Injectable()
export class AdsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly adsModerationService: AdsModerationService,
  ) {}

  async findAll(params: FindAllAdsParams = {}) {
    const activeCategories = await this.getActiveCategories();
    const categoryById = new Map(
      activeCategories.map((category) => [category.id, category]),
    );

    const categoryIds = this.getFilteredCategoryIds({
      categorySlug: params.categorySlug,
      categoryIds: params.categoryIds,
      activeCategories,
    });

    const where: Prisma.AdWhereInput = {
      ...PUBLISHED_AD_WHERE,
      category: ACTIVE_AD_CATEGORY_WHERE,
    };

    if (categoryIds?.length) {
      where.categoryId = {
        in: categoryIds,
      };
    }

    if (
      typeof params.priceFrom === 'number' ||
      typeof params.priceTo === 'number'
    ) {
      where.price = {
        gte: params.priceFrom,
        lte: params.priceTo,
      };
    }

    const ads = await this.prismaService.ad.findMany({
      where,
      include: this.getAdInclude(),
      orderBy: this.getOrderBy(params.sort),
    });

    return ads.map((ad) => this.mapAd(ad, categoryById));
  }

  async findById(adIdOrSlug: string) {
    const activeCategories = await this.getActiveCategories();
    const categoryById = new Map(
      activeCategories.map((category) => [category.id, category]),
    );

    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      adIdOrSlug,
    );

    const ad = await this.prismaService.ad.findFirst({
      where: {
        ...(isId ? { id: adIdOrSlug } : { slug: adIdOrSlug }),
        ...PUBLISHED_AD_WHERE,
        category: ACTIVE_AD_CATEGORY_WHERE,
      },
      include: this.getAdInclude(),
    });

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    return this.mapAd(ad, categoryById, { includeSellerContacts: true });
  }

  async findMyAds(sellerId: string) {
    const activeCategories = await this.getActiveCategories();
    const categoryById = new Map(
      activeCategories.map((category) => [category.id, category]),
    );

    const ads = await this.prismaService.ad.findMany({
      where: {
        sellerId,
        deletedAt: null,
      },
      include: this.getAdInclude(),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return ads.map((ad) => this.mapAd(ad, categoryById));
  }

  async create(sellerId: string, dto: CreateAdDto) {
    const title = this.getRequiredString(dto.title, 'Ad title is required');
    const categoryId = this.getRequiredString(
      dto.categoryId,
      'Ad category is required',
    );

    await this.getAdCategoryOrThrow(categoryId);

    const slug = await this.getUniqueSlug({
      value: dto.slug,
      fallback: title,
    });

    const decision = this.adsModerationService.moderateOnCreate({
      title,
      description: this.getOptionalString(dto.description) ?? '',
      price: this.getNumber(dto.price, 0),
    });

    const ad = await this.prismaService.ad.create({
      data: {
        title,
        slug,
        categoryId,
        sellerId,
        description: this.getOptionalString(dto.description) ?? '',
        price: this.getNumber(dto.price, 0),
        status: decision.status,
        moderatedAt: decision.moderatedAt,
        contactPhone: this.getOptionalString(dto.contactPhone),
        contactTelegram: this.getOptionalString(dto.contactTelegram),
        contactEmail: this.getOptionalString(dto.contactEmail),
        contactOther: this.getOptionalString(dto.contactOther),
      },
    });

    await this.replaceAdImages(ad.id, this.getImageUrls(dto.imageUrls));

    return this.getOwnedAdById(ad.id, sellerId);
  }

  async update(adId: string, sellerId: string, dto: UpdateAdDto) {
    const ad = await this.getOwnedAdOrThrow(adId, sellerId);

    const title = this.getRequiredString(dto.title, 'Ad title is required');
    const categoryId = this.getRequiredString(
      dto.categoryId,
      'Ad category is required',
    );

    await this.getAdCategoryOrThrow(categoryId);

    const slug = await this.getUniqueSlug({
      value: dto.slug,
      fallback: title,
      exceptId: adId,
    });

    const decision = this.adsModerationService.moderateOnUpdate({
      title,
      description: this.getOptionalString(dto.description) ?? '',
      price: this.getNumber(dto.price, ad.price),
    });

    await this.prismaService.ad.update({
      where: {
        id: adId,
      },
      data: {
        title,
        slug,
        categoryId,
        description: this.getOptionalString(dto.description) ?? '',
        price: this.getNumber(dto.price, ad.price),
        status: decision.status,
        moderatedAt: decision.moderatedAt,
        contactPhone: this.getOptionalString(dto.contactPhone),
        contactTelegram: this.getOptionalString(dto.contactTelegram),
        contactEmail: this.getOptionalString(dto.contactEmail),
        contactOther: this.getOptionalString(dto.contactOther),
      },
    });

    if ('imageUrls' in dto) {
      await this.replaceAdImages(adId, this.getImageUrls(dto.imageUrls));
    }

    return this.getOwnedAdById(adId, sellerId);
  }

  async softDelete(adId: string, sellerId: string) {
    await this.getOwnedAdOrThrow(adId, sellerId);

    await this.prismaService.ad.update({
      where: {
        id: adId,
      },
      data: {
        isActive: false,
        status: AdStatus.ARCHIVED,
        deletedAt: new Date(),
      },
    });
  }

  private async getOwnedAdById(adId: string, sellerId: string) {
    const activeCategories = await this.getActiveCategories();
    const categoryById = new Map(
      activeCategories.map((category) => [category.id, category]),
    );

    const ad = await this.prismaService.ad.findFirst({
      where: {
        id: adId,
        sellerId,
      },
      include: this.getAdInclude(),
    });

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    return this.mapAd(ad, categoryById, { includeSellerContacts: true });
  }

  private async getOwnedAdOrThrow(adId: string, sellerId: string) {
    const ad = await this.prismaService.ad.findFirst({
      where: {
        id: adId,
        deletedAt: null,
      },
    });

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    if (ad.sellerId !== sellerId) {
      throw new ForbiddenException('You can only manage your own ads');
    }

    return ad;
  }

  private async getAdCategoryOrThrow(id: string) {
    const category = await this.prismaService.adCategory.findFirst({
      where: {
        id,
        ...ACTIVE_AD_CATEGORY_WHERE,
      },
    });

    if (!category) {
      throw new NotFoundException('Ad category not found');
    }

    return category;
  }

  private getActiveCategories() {
    return this.prismaService.adCategory.findMany({
      where: ACTIVE_AD_CATEGORY_WHERE,
      include: {
        image: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }

  private getAdInclude() {
    return {
      category: {
        include: {
          image: true,
        },
      },
      seller: true,
      images: {
        include: {
          image: true,
        },
      },
    } satisfies Prisma.AdInclude;
  }

  private getFilteredCategoryIds(params: {
    categorySlug?: string;
    categoryIds?: string[];
    activeCategories: { id: string; slug: string; parentId: string | null }[];
  }) {
    const requestedCategoryIds = params.categoryIds?.filter(Boolean) ?? [];

    if (!params.categorySlug && !requestedCategoryIds.length) {
      return undefined;
    }

    const categoryIdsFromSlug = params.categorySlug
      ? this.getCategoryAndDescendantIds({
          categorySlug: params.categorySlug,
          categories: params.activeCategories,
        })
      : undefined;

    if (categoryIdsFromSlug && !categoryIdsFromSlug.length) {
      return [];
    }

    if (!requestedCategoryIds.length) {
      return categoryIdsFromSlug;
    }

    if (!categoryIdsFromSlug) {
      return requestedCategoryIds;
    }

    const categoryIdsFromSlugSet = new Set(categoryIdsFromSlug);

    return requestedCategoryIds.filter((categoryId) =>
      categoryIdsFromSlugSet.has(categoryId),
    );
  }

  private getCategoryAndDescendantIds(params: {
    categorySlug: string;
    categories: { id: string; slug: string; parentId: string | null }[];
  }) {
    const rootCategory = params.categories.find(
      (category) => category.slug === params.categorySlug,
    );

    if (!rootCategory) {
      return [];
    }

    const childrenByParentId = new Map<
      string,
      { id: string; slug: string; parentId: string | null }[]
    >();

    params.categories.forEach((category) => {
      if (!category.parentId) {
        return;
      }

      const children = childrenByParentId.get(category.parentId) ?? [];
      childrenByParentId.set(category.parentId, [...children, category]);
    });

    const result: string[] = [];
    const stack = [rootCategory];

    while (stack.length) {
      const category = stack.pop();

      if (!category) {
        continue;
      }

      result.push(category.id);
      stack.push(...(childrenByParentId.get(category.id) ?? []));
    }

    return result;
  }

  private getOrderBy(sort?: string): Prisma.AdOrderByWithRelationInput[] {
    const sortRules = sort
      ?.split(',')
      .map((rawRule) => {
        const [field, direction] = rawRule.split(':');

        if (
          !SORT_FIELD_WHITELIST.has(field as AdSortField) ||
          !SORT_DIRECTION_WHITELIST.has(direction as AdSortDirection)
        ) {
          return undefined;
        }

        return {
          field: field as AdSortField,
          direction: direction as AdSortDirection,
        };
      })
      .filter(Boolean) as
      | { field: AdSortField; direction: AdSortDirection }[]
      | undefined;

    if (!sortRules?.length) {
      return [{ createdAt: 'desc' }];
    }

    return sortRules.map((rule) => {
      if (rule.field === 'category') {
        return {
          category: {
            name: rule.direction,
          },
        };
      }

      return {
        [rule.field]: rule.direction,
      };
    });
  }

  private async replaceAdImages(adId: string, imageUrls: string[]) {
    await this.prismaService.adImage.deleteMany({
      where: {
        adId,
      },
    });

    await Promise.all(
      imageUrls.map(async (url, index) => {
        const image = await this.prismaService.image.create({
          data: {
            url,
            sortOrder: index,
          },
        });

        return this.prismaService.adImage.create({
          data: {
            adId,
            imageId: image.id,
          },
        });
      }),
    );
  }

  private getCategoryPath(
    category: { id: string; slug: string; parentId: string | null },
    categoryById: Map<string, any>,
  ) {
    const parts: string[] = [];
    let currentCategory = category;

    while (currentCategory) {
      parts.unshift(currentCategory.slug);

      if (!currentCategory.parentId) {
        break;
      }

      currentCategory = categoryById.get(currentCategory.parentId);
    }

    return parts.join('/');
  }

  private mapCategory(category: any, categoryById: Map<string, any>) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      path: this.getCategoryPath(category, categoryById),
      sortOrder: category.sortOrder,
      description: category.description ?? undefined,
      parentId: category.parentId ?? undefined,
      image: category.image ?? undefined,
    };
  }

  private mapSeller(seller: any, includeContacts: boolean) {
    return {
      id: seller.id,
      nickname: seller.nickname,
      nicknameSuffix: seller.nicknameSuffix,
      ...(includeContacts
        ? {
            phone: seller.phone ?? undefined,
            email: seller.email ?? undefined,
          }
        : {}),
    };
  }

  private mapAd(
    ad: any,
    categoryById: Map<string, any>,
    options: { includeSellerContacts?: boolean } = {},
  ) {
    return {
      id: ad.id,
      categoryId: ad.categoryId,
      category: ad.category
        ? this.mapCategory(ad.category, categoryById)
        : undefined,
      seller: ad.seller
        ? this.mapSeller(ad.seller, Boolean(options.includeSellerContacts))
        : undefined,
      title: ad.title,
      slug: ad.slug,
      description: ad.description,
      price: ad.price,
      status: ad.status,
      moderatedAt: ad.moderatedAt,
      createdAt: ad.createdAt,
      updatedAt: ad.updatedAt,
      contactPhone: ad.contactPhone ?? undefined,
      contactTelegram: ad.contactTelegram ?? undefined,
      contactEmail: ad.contactEmail ?? undefined,
      contactOther: ad.contactOther ?? undefined,
      images: (ad.images ?? [])
        .map((adImage: any) => adImage.image)
        .sort(
          (firstImage: any, secondImage: any) =>
            firstImage.sortOrder - secondImage.sortOrder,
        ),
    };
  }

  private getImageUrls(value: unknown) {
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean);
    }

    if (typeof value !== 'string') {
      return [];
    }

    return value
      .split('\n')
      .map((url) => url.trim())
      .filter(Boolean);
  }

  private async getUniqueSlug(params: {
    value: unknown;
    fallback: string;
    exceptId?: string;
  }) {
    const baseSlug = this.slugify(
      this.getOptionalString(params.value) ?? params.fallback,
    );

    let slug = baseSlug;
    let counter = 1;

    while (await this.isSlugBusy(slug, params.exceptId)) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return slug;
  }

  private async isSlugBusy(slug: string, exceptId?: string) {
    const ad = await this.prismaService.ad.findFirst({
      where: {
        slug,
        deletedAt: null,
        id: exceptId ? { not: exceptId } : undefined,
      },
    });

    return Boolean(ad);
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
        .replace(/(^-|-$)+/g, '') || 'ad'
    );
  }

  private getRequiredString(value: unknown, message: string) {
    const result = this.getOptionalString(value);

    if (!result) {
      throw new BadRequestException(message);
    }

    return result;
  }

  private getOptionalString(value: unknown) {
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmedValue = value.trim();

    return trimmedValue || undefined;
  }

  private getNumber(value: unknown, fallback: number) {
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
}
