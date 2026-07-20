import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { AdminInputService } from './admin-input.service';

@Injectable()
export class AdminAdsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly adminInputService: AdminInputService,
  ) {}

  async createAdCategory(body: unknown) {
    const payload = this.adminInputService.getObjectBody(body);
    const name = this.adminInputService.getRequiredString(
      payload.name,
      'Ad category name is required',
    );
    const parentId = this.adminInputService.getOptionalString(payload.parentId);

    await this.assertValidAdCategoryParent(parentId);

    const adCategory = await this.prismaService.adCategory.create({
      data: {
        name,
        slug: await this.adminInputService.getUniqueSlug({
          entity: 'adCategory',
          value: payload.slug,
          fallback: name,
        }),
        description: this.adminInputService.getOptionalString(payload.description),
        parentId,
        imageId: await this.createImageFromPayload(payload),
        sortOrder: this.adminInputService.getNumber(payload.sortOrder, 0),
        isActive: this.adminInputService.getBoolean(payload.isActive, true),
      },
      include: this.categoryInclude,
    });

    return this.mapAdCategory(adCategory, new Map([[adCategory.id, adCategory]]));
  }

  async updateAdCategory(id: string, body: unknown) {
    const currentCategory = await this.getAdCategoryOrThrow(id);
    const payload = this.adminInputService.getObjectBody(body);
    const name = this.adminInputService.getRequiredString(
      payload.name,
      'Ad category name is required',
    );
    const parentId = this.adminInputService.getOptionalString(payload.parentId);

    await this.assertValidAdCategoryParent(parentId, id);

    const adCategory = await this.prismaService.adCategory.update({
      where: { id },
      data: {
        name,
        slug: await this.adminInputService.getUniqueSlug({
          entity: 'adCategory',
          value: payload.slug,
          fallback: name,
          exceptId: id,
        }),
        description: this.adminInputService.getOptionalString(payload.description),
        parentId,
        imageId: await this.resolveImageFromPayload(
          payload,
          currentCategory.imageId,
        ),
        sortOrder: this.adminInputService.getNumber(payload.sortOrder, 0),
        isActive: this.adminInputService.getBoolean(payload.isActive, true),
      },
      include: this.categoryInclude,
    });
    const adCategories = await this.prismaService.adCategory.findMany({
      include: this.categoryInclude,
    });

    return this.mapAdCategory(
      adCategory,
      new Map(adCategories.map((item) => [item.id, item])),
    );
  }

  async deleteAdCategory(id: string) {
    await this.getAdCategoryOrThrow(id);

    return this.prismaService.adCategory.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
  }

  async restoreAdCategory(id: string) {
    await this.getAdCategoryOrThrow(id);

    return this.prismaService.adCategory.update({
      where: { id },
      data: { isActive: true, deletedAt: null },
    });
  }

  async hardDeleteAdCategory(id: string) {
    await this.getAdCategoryOrThrow(id);
    await this.assertAdCategoryCanBeHardDeleted(id);

    return this.prismaService.adCategory.delete({ where: { id } });
  }

  async bulkDeleteAdCategories(body: unknown) {
    const ids = this.adminInputService.getIdsFromBody(body);
    await this.prismaService.adCategory.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false, deletedAt: new Date() },
    });

    return { deleted: ids.length };
  }

  async bulkHardDeleteAdCategories(body: unknown) {
    const ids = this.adminInputService.getIdsFromBody(body);
    await this.prismaService.adCategory.deleteMany({
      where: { id: { in: ids } },
    });

    return { deleted: ids.length };
  }

  async bulkRestoreAdCategories(body: unknown) {
    const ids = this.adminInputService.getIdsFromBody(body);
    await this.prismaService.adCategory.updateMany({
      where: { id: { in: ids } },
      data: { isActive: true, deletedAt: null },
    });

    return { restored: ids.length };
  }

  async updateAd(id: string, body: unknown) {
    await this.getAdOrThrow(id);

    const payload = this.adminInputService.getObjectBody(body);
    const title = this.adminInputService.getRequiredString(
      payload.title,
      'Ad title is required',
    );
    const categoryId = this.adminInputService.getRequiredString(
      payload.categoryId,
      'Ad category is required',
    );

    await this.getAdCategoryOrThrow(categoryId);

    await this.prismaService.ad.update({
      where: { id },
      data: {
        title,
        slug: await this.adminInputService.getUniqueSlug({
          entity: 'ad',
          value: payload.slug,
          fallback: title,
          exceptId: id,
        }),
        categoryId,
        description: this.adminInputService.getOptionalString(payload.description) ?? '',
        price: this.adminInputService.getNumber(payload.price, 0),
        status: this.getAdStatus(payload.status),
        moderatedAt: new Date(),
        isActive: this.adminInputService.getBoolean(payload.isActive, true),
        contactPhone: this.adminInputService.getOptionalString(payload.contactPhone),
        contactTelegram: this.adminInputService.getOptionalString(payload.contactTelegram),
        contactEmail: this.adminInputService.getOptionalString(payload.contactEmail),
        contactOther: this.adminInputService.getOptionalString(payload.contactOther),
      },
    });

    if ('imageUrls' in payload) {
      await this.replaceAdImages(id, this.adminInputService.getImageUrls(payload));
    }

    return this.getAdminAdById(id);
  }

  async deleteAd(id: string) {
    await this.getAdOrThrow(id);

    return this.prismaService.ad.update({
      where: { id },
      data: {
        isActive: false,
        status: AdStatus.ARCHIVED,
        deletedAt: new Date(),
      },
    });
  }

  async restoreAd(id: string) {
    await this.getAdOrThrow(id);

    return this.prismaService.ad.update({
      where: { id },
      data: {
        isActive: true,
        status: AdStatus.PUBLISHED,
        moderatedAt: new Date(),
        deletedAt: null,
      },
    });
  }

  async hardDeleteAd(id: string) {
    await this.getAdOrThrow(id);

    return this.prismaService.$transaction(async (transaction) => {
      await transaction.adImage.deleteMany({ where: { adId: id } });

      return transaction.ad.delete({ where: { id } });
    });
  }

  async bulkDeleteAds(body: unknown) {
    const ids = this.adminInputService.getIdsFromBody(body);
    await this.prismaService.ad.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false, status: AdStatus.ARCHIVED, deletedAt: new Date() },
    });

    return { deleted: ids.length };
  }

  async bulkHardDeleteAds(body: unknown) {
    const ids = this.adminInputService.getIdsFromBody(body);
    await this.prismaService.$transaction(async (transaction) => {
      await transaction.adImage.deleteMany({ where: { adId: { in: ids } } });
      await transaction.ad.deleteMany({ where: { id: { in: ids } } });
    });

    return { deleted: ids.length };
  }

  async bulkRestoreAds(body: unknown) {
    const ids = this.adminInputService.getIdsFromBody(body);
    await this.prismaService.ad.updateMany({
      where: { id: { in: ids } },
      data: {
        isActive: true,
        status: AdStatus.PUBLISHED,
        deletedAt: null,
      },
    });

    return { restored: ids.length };
  }

  private readonly categoryInclude = {
    image: true,
    _count: { select: { ads: true } },
  } as const;

  private async getAdminAdById(id: string) {
    const [adCategories, ad] = await Promise.all([
      this.prismaService.adCategory.findMany({ include: this.categoryInclude }),
      this.prismaService.ad.findUnique({
        where: { id },
        include: {
          category: { include: { image: true } },
          seller: true,
          images: { include: { image: true } },
        },
      }),
    ]);

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    return this.mapAd(ad, new Map(adCategories.map((item) => [item.id, item])));
  }

  private async getAdOrThrow(id: string) {
    const ad = await this.prismaService.ad.findUnique({ where: { id } });

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    return ad;
  }

  private async getAdCategoryOrThrow(id: string) {
    const adCategory = await this.prismaService.adCategory.findUnique({
      where: { id },
    });

    if (!adCategory) {
      throw new NotFoundException('Ad category not found');
    }

    return adCategory;
  }

  private async assertValidAdCategoryParent(
    parentId?: string,
    categoryId?: string,
  ) {
    if (!parentId) return;

    if (parentId === categoryId) {
      throw new BadRequestException('Ad category cannot be its own parent');
    }

    const visitedCategoryIds = new Set<string>();
    let currentParentId: string | null | undefined = parentId;

    while (currentParentId) {
      if (visitedCategoryIds.has(currentParentId)) {
        throw new BadRequestException('Ad category parent tree contains a cycle');
      }

      visitedCategoryIds.add(currentParentId);
      const parentCategory = await this.prismaService.adCategory.findUnique({
        where: { id: currentParentId },
        select: { id: true, parentId: true },
      });

      if (!parentCategory) {
        throw new NotFoundException('Parent ad category not found');
      }

      if (parentCategory.parentId === categoryId) {
        throw new BadRequestException(
          'Ad category cannot use its descendant as parent',
        );
      }

      currentParentId = parentCategory.parentId;
    }
  }

  private async replaceAdImages(adId: string, imageUrls: string[]) {
    await this.prismaService.adImage.deleteMany({ where: { adId } });

    await Promise.all(
      imageUrls.map(async (url, index) => {
        const image = await this.prismaService.image.create({
          data: { url, sortOrder: index },
        });

        return this.prismaService.adImage.create({
          data: { adId, imageId: image.id },
        });
      }),
    );
  }

  private getAdStatus(value: unknown): AdStatus {
    return typeof value === 'string' && Object.values(AdStatus).includes(value as AdStatus)
      ? (value as AdStatus)
      : AdStatus.PUBLISHED;
  }

  private async assertAdCategoryCanBeHardDeleted(id: string) {
    const [childrenCount, adsCount] = await Promise.all([
      this.prismaService.adCategory.count({ where: { parentId: id } }),
      this.prismaService.ad.count({ where: { categoryId: id } }),
    ]);
    const blockers: string[] = [];

    if (childrenCount > 0) blockers.push('есть дочерние категории');
    if (adsCount > 0) blockers.push('есть связанные объявления');

    if (blockers.length) {
      throw new BadRequestException(
        `Категорию объявлений нельзя удалить навсегда: ${blockers.join(', ')}.`,
      );
    }
  }

  private async resolveImageFromPayload(
    payload: Record<string, unknown>,
    currentImageId?: string | null,
  ) {
    if (!('imageUrl' in payload)) return currentImageId ?? null;

    const imageUrl = this.adminInputService.getOptionalString(payload.imageUrl);

    if (!imageUrl) return null;

    const alt = this.adminInputService.getOptionalString(payload.imageAlt);

    if (currentImageId) {
      const image = await this.prismaService.image.update({
        where: { id: currentImageId },
        data: { url: imageUrl, alt },
      });

      return image.id;
    }

    return this.createImageFromPayload(payload);
  }

  private async createImageFromPayload(payload: Record<string, unknown>) {
    const imageUrl = this.adminInputService.getOptionalString(payload.imageUrl);

    if (!imageUrl) return null;

    const image = await this.prismaService.image.create({
      data: {
        url: imageUrl,
        alt: this.adminInputService.getOptionalString(payload.imageAlt),
        sortOrder: 0,
      },
    });

    return image.id;
  }

  private mapAd(ad: any, adCategoryById: Map<string, any>) {
    return {
      id: ad.id,
      categoryId: ad.categoryId,
      category: ad.category
        ? this.mapAdCategory(ad.category, adCategoryById)
        : undefined,
      seller: ad.seller
        ? {
            id: ad.seller.id,
            nickname: ad.seller.nickname,
            nicknameSuffix: ad.seller.nicknameSuffix,
            email: ad.seller.email,
            phone: ad.seller.phone ?? undefined,
          }
        : undefined,
      title: ad.title,
      slug: ad.slug,
      description: ad.description,
      price: ad.price,
      status: ad.status,
      moderatedAt: ad.moderatedAt,
      isActive: ad.isActive,
      deletedAt: ad.deletedAt,
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

  private mapAdCategory(adCategory: any, adCategoryById: Map<string, any>) {
    const path: string[] = [];
    const visitedCategoryIds = new Set<string>();
    let currentCategory = adCategory;

    while (currentCategory && !visitedCategoryIds.has(currentCategory.id)) {
      visitedCategoryIds.add(currentCategory.id);
      path.unshift(currentCategory.slug);
      currentCategory = currentCategory.parentId
        ? adCategoryById.get(currentCategory.parentId)
        : undefined;
    }

    return {
      id: adCategory.id,
      name: adCategory.name,
      slug: adCategory.slug,
      path: path.join('/'),
      sortOrder: adCategory.sortOrder,
      description: adCategory.description ?? undefined,
      parentId: adCategory.parentId ?? undefined,
      image: adCategory.image ?? undefined,
      isActive: adCategory.isActive,
      deletedAt: adCategory.deletedAt,
      adsCount: adCategory._count?.ads ?? 0,
    };
  }
}
