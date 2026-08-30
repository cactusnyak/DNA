import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CatalogCollectionType, PackageType, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { locationToJson } from '../common/location';
import { contentDescriptionToJson } from '../common/content-description';
import {
  normalizeProductAdditions,
  productAdditionsToJson,
} from '../products/product-additions';
import { resolveEffectiveOversizedStatus } from '../products/oversized-status';

import { AdminInputService } from './admin-input.service';
import { OrderDeliveryInvalidationService } from '../delivery-providers/order-delivery-invalidation.service';

const ADMIN_PRODUCT_INCLUDE = {
  category: {
    include: { image: true, _count: { select: { products: true } } },
  },
  images: { include: { image: true } },
  shippingProfile: {
    include: { packages: { orderBy: { sequence: 'asc' as const } } },
  },
  warehouses: { include: { warehouse: true } },
  deliveryServices: {
    include: { deliveryService: { include: { provider: true } } },
  },
  rewardShares: {
    include: { level: true },
    orderBy: { depth: 'asc' as const },
  },
} satisfies Prisma.ProductInclude;

type AdminProductRecord = Prisma.ProductGetPayload<{
  include: typeof ADMIN_PRODUCT_INCLUDE;
}>;

type AdminProductViewRecord = Omit<
  AdminProductRecord,
  'shippingProfile' | 'warehouses' | 'deliveryServices' | 'rewardShares'
> &
  Partial<
    Pick<
      AdminProductRecord,
      'shippingProfile' | 'warehouses' | 'deliveryServices' | 'rewardShares'
    >
  >;

@Injectable()
export class AdminMarketCatalogService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly adminInputService: AdminInputService,
    private readonly deliveryInvalidation?: OrderDeliveryInvalidationService,
  ) {}

  async createCategory(body: unknown) {
    const payload = this.adminInputService.getObjectBody(body);
    const name = this.adminInputService.getRequiredString(
      payload.name,
      'Category name is required',
    );
    const parentId = this.adminInputService.getOptionalString(payload.parentId);
    const slug = await this.adminInputService.getUniqueSlug({
      entity: 'marketCategory',
      value: payload.slug,
      fallback: name,
    });

    await this.assertValidMarketCategoryParent(parentId);

    const category = await this.prismaService.marketCategory.create({
      data: {
        name,
        slug,
        description: this.adminInputService.getOptionalString(
          payload.description,
        ),
        parentId,
        imageId: await this.createImageFromPayload(payload),
        sortOrder: this.adminInputService.getNumber(payload.sortOrder, 0),
        isActive: this.adminInputService.getBoolean(payload.isActive, true),
        isOversized: this.adminInputService.getBoolean(
          payload.isOversized,
          false,
        ),
      },
      include: this.categoryInclude,
    });

    return this.mapMarketCategory(category, new Map([[category.id, category]]));
  }

  async updateCategory(id: string, body: unknown) {
    const currentCategory = await this.getCategoryOrThrow(id);
    const payload = this.adminInputService.getObjectBody(body);
    const name = this.adminInputService.getRequiredString(
      payload.name,
      'Category name is required',
    );
    const parentId = this.adminInputService.getOptionalString(payload.parentId);
    const slug = await this.adminInputService.getUniqueSlug({
      entity: 'marketCategory',
      value: payload.slug,
      fallback: name,
      exceptId: id,
    });

    await this.assertValidMarketCategoryParent(parentId, id);

    const category = await this.prismaService.marketCategory.update({
      where: { id },
      data: {
        name,
        slug,
        description: this.adminInputService.getOptionalString(
          payload.description,
        ),
        parentId,
        imageId: await this.resolveImageFromPayload(
          payload,
          currentCategory.imageId,
        ),
        sortOrder: this.adminInputService.getNumber(payload.sortOrder, 0),
        isActive: this.adminInputService.getBoolean(payload.isActive, true),
        isOversized: this.adminInputService.getBoolean(
          payload.isOversized,
          false,
        ),
      },
      include: this.categoryInclude,
    });
    const categories = await this.prismaService.marketCategory.findMany({
      include: this.categoryInclude,
    });

    return this.mapMarketCategory(
      category,
      new Map(categories.map((item) => [item.id, item])),
    );
  }

  async createProduct(body: unknown) {
    const payload = this.adminInputService.getObjectBody(body);
    const title = this.adminInputService.getRequiredString(
      payload.title,
      'Product title is required',
    );
    const categoryId = this.adminInputService.getRequiredString(
      payload.categoryId,
      'Product category is required',
    );

    await this.getCategoryOrThrow(categoryId);
    await this.assertUniqueSku(payload.sku);

    const product = await this.prismaService.product.create({
      data: {
        title,
        slug: await this.adminInputService.getUniqueSlug({
          entity: 'product',
          value: payload.slug,
          fallback: title,
        }),
        categoryId,
        description: contentDescriptionToJson(payload.description),
        price: this.adminInputService.getNumber(payload.price, 0),
        sku: this.adminInputService.getOptionalString(payload.sku),
        purchasePrice: this.getOptionalNonnegativeInteger(
          payload.purchasePrice,
          'Purchase price',
        ),
        rewardEnabled: this.adminInputService.getBoolean(
          payload.rewardEnabled,
          false,
        ),
        location: locationToJson(payload.location),
        additions: productAdditionsToJson(
          normalizeProductAdditions(payload.additions),
        ),
        isActive: this.adminInputService.getBoolean(payload.isActive, true),
        isOversizedOverride: this.getNullableBoolean(
          payload.isOversizedOverride,
        ),
      },
    });

    await this.replaceProductImages(
      product.id,
      this.adminInputService.getImageUrls(payload),
    );
    await this.replaceProductLogistics(product.id, payload);
    await this.replaceProductRewards(product.id, payload);

    return this.getAdminProductById(product.id);
  }

  async updateProduct(id: string, body: unknown) {
    await this.getProductOrThrow(id);

    const payload = this.adminInputService.getObjectBody(body);
    const title = this.adminInputService.getRequiredString(
      payload.title,
      'Product title is required',
    );
    const categoryId = this.adminInputService.getRequiredString(
      payload.categoryId,
      'Product category is required',
    );

    await this.getCategoryOrThrow(categoryId);
    await this.assertUniqueSku(payload.sku, id);

    await this.prismaService.$transaction(async (transaction) => {
      await transaction.product.update({
        where: { id },
        data: {
          title,
          slug: await this.adminInputService.getUniqueSlug({
            entity: 'product',
            value: payload.slug,
            fallback: title,
            exceptId: id,
          }),
          categoryId,
          description: contentDescriptionToJson(payload.description),
          price: this.adminInputService.getNumber(payload.price, 0),
          sku: this.adminInputService.getOptionalString(payload.sku),
          purchasePrice: this.getOptionalNonnegativeInteger(
            payload.purchasePrice,
            'Purchase price',
          ),
          rewardEnabled: this.adminInputService.getBoolean(
            payload.rewardEnabled,
            false,
          ),
          location: locationToJson(payload.location),
          additions: productAdditionsToJson(
            normalizeProductAdditions(payload.additions),
          ),
          isActive: this.adminInputService.getBoolean(payload.isActive, true),
          isOversizedOverride: this.getNullableBoolean(
            payload.isOversizedOverride,
          ),
        },
      });
      await this.replaceProductLogistics(id, payload, transaction);
      await this.replaceProductRewards(id, payload, transaction);
    });

    if ('imageUrls' in payload) {
      await this.replaceProductImages(
        id,
        this.adminInputService.getImageUrls(payload),
      );
    }

    if ('logistics' in payload)
      await this.deliveryInvalidation?.invalidateAffected({ productId: id });

    return this.getAdminProductById(id);
  }

  async deleteProduct(id: string) {
    await this.getProductOrThrow(id);

    return this.prismaService.product.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
  }

  async restoreProduct(id: string) {
    await this.getProductOrThrow(id);

    return this.prismaService.product.update({
      where: { id },
      data: { isActive: true, deletedAt: null },
    });
  }

  async hardDeleteProduct(id: string) {
    await this.getProductOrThrow(id);
    await this.assertProductCanBeHardDeleted(id);

    return this.prismaService.$transaction(async (transaction) => {
      await transaction.productImage.deleteMany({ where: { productId: id } });

      return transaction.product.delete({ where: { id } });
    });
  }

  async bulkDeleteProducts(body: unknown) {
    const ids = this.adminInputService.getIdsFromBody(body);
    await this.prismaService.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false, deletedAt: new Date() },
    });

    return { deleted: ids.length };
  }

  async bulkHardDeleteProducts(body: unknown) {
    const ids = this.adminInputService.getIdsFromBody(body);
    await this.prismaService.$transaction(async (transaction) => {
      await transaction.productImage.deleteMany({
        where: { productId: { in: ids } },
      });
      await transaction.product.deleteMany({ where: { id: { in: ids } } });
    });

    return { deleted: ids.length };
  }

  async bulkRestoreProducts(body: unknown) {
    const ids = this.adminInputService.getIdsFromBody(body);
    await this.prismaService.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive: true, deletedAt: null },
    });

    return { restored: ids.length };
  }

  async deleteCategory(id: string) {
    await this.getCategoryOrThrow(id);

    return this.prismaService.marketCategory.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
  }

  async restoreCategory(id: string) {
    await this.getCategoryOrThrow(id);

    return this.prismaService.marketCategory.update({
      where: { id },
      data: { isActive: true, deletedAt: null },
    });
  }

  async hardDeleteCategory(id: string) {
    await this.getCategoryOrThrow(id);
    await this.assertCategoryCanBeHardDeleted(id);

    return this.prismaService.marketCategory.delete({ where: { id } });
  }

  async bulkDeleteMarketCategories(body: unknown) {
    const ids = this.adminInputService.getIdsFromBody(body);
    await this.prismaService.marketCategory.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false, deletedAt: new Date() },
    });

    return { deleted: ids.length };
  }

  async bulkHardDeleteMarketCategories(body: unknown) {
    const ids = this.adminInputService.getIdsFromBody(body);
    await this.prismaService.marketCategory.deleteMany({
      where: { id: { in: ids } },
    });

    return { deleted: ids.length };
  }

  async bulkRestoreMarketCategories(body: unknown) {
    const ids = this.adminInputService.getIdsFromBody(body);
    await this.prismaService.marketCategory.updateMany({
      where: { id: { in: ids } },
      data: { isActive: true, deletedAt: null },
    });

    return { restored: ids.length };
  }

  async createCatalogCollection(body: unknown) {
    const payload = this.adminInputService.getObjectBody(body);
    const title = this.adminInputService.getRequiredString(
      payload.title,
      'Collection title is required',
    );

    return this.prismaService.catalogCollection.create({
      data: {
        title,
        slug: await this.adminInputService.getUniqueSlug({
          entity: 'collection',
          value: payload.slug,
          fallback: title,
        }),
        type: this.adminInputService.getCollectionType(payload.type),
        description: this.adminInputService.getOptionalString(
          payload.description,
        ),
        isActive: this.adminInputService.getBoolean(payload.isActive, true),
      },
    });
  }

  async updateCatalogCollection(id: string, body: unknown) {
    await this.getCatalogCollectionOrThrow(id);

    const payload = this.adminInputService.getObjectBody(body);
    const title = this.adminInputService.getRequiredString(
      payload.title,
      'Collection title is required',
    );

    return this.prismaService.catalogCollection.update({
      where: { id },
      data: {
        title,
        slug: await this.adminInputService.getUniqueSlug({
          entity: 'collection',
          value: payload.slug,
          fallback: title,
          exceptId: id,
        }),
        type: this.adminInputService.getCollectionType(payload.type),
        description: this.adminInputService.getOptionalString(
          payload.description,
        ),
        isActive: this.adminInputService.getBoolean(payload.isActive, true),
      },
    });
  }

  async deleteCatalogCollection(id: string) {
    await this.getCatalogCollectionOrThrow(id);

    return this.prismaService.catalogCollection.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async restoreCatalogCollection(id: string) {
    await this.getCatalogCollectionOrThrow(id);

    return this.prismaService.catalogCollection.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async hardDeleteCatalogCollection(id: string) {
    await this.getCatalogCollectionOrThrow(id);

    return this.prismaService.catalogCollection.delete({ where: { id } });
  }

  async updateCatalogCollectionCategories(id: string, body: unknown) {
    const collection = await this.getCatalogCollectionOrThrow(id);

    if (collection.type !== CatalogCollectionType.CATEGORY) {
      throw new BadRequestException('Collection is not a category collection');
    }

    const items = this.getCollectionItems(body);

    await this.prismaService.$transaction([
      this.prismaService.catalogCollectionCategory.deleteMany({
        where: { collectionId: id },
      }),
      ...items.map((item, index) =>
        this.prismaService.catalogCollectionCategory.create({
          data: {
            collectionId: id,
            categoryId: item.id,
            sortOrder: item.sortOrder ?? index,
          },
        }),
      ),
    ]);

    return this.getCatalogCollectionById(id);
  }

  async updateCatalogCollectionProducts(id: string, body: unknown) {
    const collection = await this.getCatalogCollectionOrThrow(id);

    if (collection.type !== CatalogCollectionType.PRODUCT) {
      throw new BadRequestException('Collection is not a product collection');
    }

    const items = this.getCollectionItems(body);

    await this.prismaService.$transaction([
      this.prismaService.catalogCollectionProduct.deleteMany({
        where: { collectionId: id },
      }),
      ...items.map((item, index) =>
        this.prismaService.catalogCollectionProduct.create({
          data: {
            collectionId: id,
            productId: item.id,
            sortOrder: item.sortOrder ?? index,
          },
        }),
      ),
    ]);

    return this.getCatalogCollectionById(id);
  }

  private readonly categoryInclude = {
    image: true,
    _count: { select: { products: true } },
  } as const;

  private async getAdminProductById(id: string) {
    const categories = await this.prismaService.marketCategory.findMany({
      include: this.categoryInclude,
    });
    const categoryById = new Map(categories.map((item) => [item.id, item]));
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: ADMIN_PRODUCT_INCLUDE,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapProduct(product, categoryById);
  }

  private async getCatalogCollectionById(id: string) {
    const categories = await this.prismaService.marketCategory.findMany({
      include: this.categoryInclude,
    });
    const categoryById = new Map(categories.map((item) => [item.id, item]));
    const collection = await this.prismaService.catalogCollection.findUnique({
      where: { id },
      include: {
        categories: {
          include: { category: { include: this.categoryInclude } },
          orderBy: { sortOrder: 'asc' },
        },
        products: {
          include: {
            product: {
              include: {
                category: { include: this.categoryInclude },
                images: { include: { image: true } },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return {
      id: collection.id,
      slug: collection.slug,
      type: collection.type,
      title: collection.title,
      description: collection.description ?? undefined,
      isActive: collection.isActive,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      categories: collection.categories.map((item) => ({
        sortOrder: item.sortOrder,
        category: this.mapMarketCategory(item.category, categoryById),
      })),
      products: collection.products.map((item) => ({
        sortOrder: item.sortOrder,
        product: this.mapProduct(item.product, categoryById),
      })),
    };
  }

  private getCollectionItems(body: unknown) {
    const payload = this.adminInputService.getObjectBody(body);

    if (!Array.isArray(payload.items)) {
      throw new BadRequestException('items must be an array');
    }

    const items = payload.items
      .filter(
        (item): item is { id: string; sortOrder?: number } =>
          Boolean(item) &&
          typeof item === 'object' &&
          typeof (item as { id?: unknown }).id === 'string',
      )
      .map((item) => ({
        id: item.id,
        sortOrder:
          typeof item.sortOrder === 'number' && Number.isFinite(item.sortOrder)
            ? item.sortOrder
            : undefined,
      }));

    if (items.length !== payload.items.length) {
      throw new BadRequestException('Each collection item must have an id');
    }

    return items;
  }

  private async getCatalogCollectionOrThrow(id: string) {
    const collection = await this.prismaService.catalogCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  private async getProductOrThrow(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  private async assertProductCanBeHardDeleted(id: string) {
    const [
      orderItemsCount,
      cartItemsCount,
      collectionProductsCount,
      warehouseCount,
      serviceCount,
      shippingProfileCount,
    ] = await Promise.all([
      this.prismaService.orderItem.count({ where: { productId: id } }),
      this.prismaService.cartItem.count({ where: { productId: id } }),
      this.prismaService.catalogCollectionProduct.count({
        where: { productId: id },
      }),
      this.prismaService.productWarehouse.count({ where: { productId: id } }),
      this.prismaService.productDeliveryService.count({
        where: { productId: id },
      }),
      this.prismaService.productShippingProfile.count({
        where: { productId: id },
      }),
    ]);
    const blockers: string[] = [];

    if (orderItemsCount > 0) blockers.push('продукт есть в заказах');
    if (cartItemsCount > 0)
      blockers.push('продукт есть в корзинах пользователей');
    if (collectionProductsCount > 0)
      blockers.push('продукт используется в подборках');
    if (warehouseCount > 0 || serviceCount > 0 || shippingProfileCount > 0)
      blockers.push('настроены логистические связи');

    if (blockers.length) {
      throw new BadRequestException(
        `Продукт нельзя удалить навсегда: ${blockers.join(', ')}.`,
      );
    }
  }

  private async replaceProductImages(productId: string, imageUrls: string[]) {
    await this.prismaService.productImage.deleteMany({ where: { productId } });

    await Promise.all(
      imageUrls.map(async (url, index) => {
        const image = await this.prismaService.image.create({
          data: { url, sortOrder: index },
        });

        return this.prismaService.productImage.create({
          data: { productId, imageId: image.id },
        });
      }),
    );
  }

  private async getCategoryOrThrow(id: string) {
    const category = await this.prismaService.marketCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  private async assertValidMarketCategoryParent(
    parentId?: string,
    categoryId?: string,
  ) {
    if (!parentId) {
      return;
    }

    if (parentId === categoryId) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    const visitedCategoryIds = new Set<string>();
    let currentParentId: string | null | undefined = parentId;

    while (currentParentId) {
      if (visitedCategoryIds.has(currentParentId)) {
        throw new BadRequestException('Category parent tree contains a cycle');
      }

      visitedCategoryIds.add(currentParentId);
      const parentCategory = await this.prismaService.marketCategory.findUnique(
        {
          where: { id: currentParentId },
          select: { id: true, parentId: true },
        },
      );

      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }

      if (parentCategory.parentId === categoryId) {
        throw new BadRequestException(
          'Category cannot use its descendant as parent',
        );
      }

      currentParentId = parentCategory.parentId;
    }
  }

  private async assertCategoryCanBeHardDeleted(id: string) {
    const [childrenCount, productsCount, collectionCategoriesCount] =
      await Promise.all([
        this.prismaService.marketCategory.count({ where: { parentId: id } }),
        this.prismaService.product.count({ where: { categoryId: id } }),
        this.prismaService.catalogCollectionCategory.count({
          where: { categoryId: id },
        }),
      ]);
    const blockers: string[] = [];

    if (childrenCount > 0) blockers.push('есть дочерние категории');
    if (productsCount > 0) blockers.push('есть связанные продукты');
    if (collectionCategoriesCount > 0)
      blockers.push('категория используется в подборках');

    if (blockers.length) {
      throw new BadRequestException(
        `Категорию нельзя удалить навсегда: ${blockers.join(', ')}.`,
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

  private mapProduct(
    product: AdminProductViewRecord,
    categoryById: Map<string, any>,
  ) {
    return {
      id: product.id,
      categoryId: product.categoryId,
      category: product.category
        ? this.mapMarketCategory(product.category, categoryById)
        : undefined,
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: product.price,
      sku: product.sku,
      purchasePrice: product.purchasePrice,
      rewardEnabled: product.rewardEnabled,
      rewardShares: product.rewardShares ?? [],
      rewardConfigVersion: Math.max(
        1,
        ...(product.rewardShares ?? []).map(
          (share) => share.level?.configVersion ?? 1,
        ),
      ),
      location: product.location,
      additions: normalizeProductAdditions(product.additions),
      isOversizedOverride: product.isOversizedOverride,
      isOversized: resolveEffectiveOversizedStatus(
        product.isOversizedOverride,
        product.category?.isOversized ?? false,
      ),
      isActive: product.isActive,
      deletedAt: product.deletedAt,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      shippingProfile: product.shippingProfile,
      warehouses: product.warehouses ?? [],
      deliveryServices: product.deliveryServices ?? [],
      logisticsReadiness: this.getProductLogisticsReadiness(product),
      images: (product.images ?? [])
        .map((productImage) => productImage.image)
        .sort(
          (firstImage, secondImage) =>
            firstImage.sortOrder - secondImage.sortOrder,
        ),
    };
  }

  private async replaceProductRewards(
    productId: string,
    payload: Record<string, unknown>,
    tx: Prisma.TransactionClient | PrismaService = this.prismaService,
  ) {
    const levels = await tx.rewardProgramLevel.findMany({
      where: { isActive: true },
      orderBy: { depth: 'asc' },
    });
    const currentVersion = Math.max(
      1,
      ...levels.map((level) => level.configVersion),
    );
    const submittedVersion = this.adminInputService.getNumber(
      payload.rewardConfigVersion,
      currentVersion,
    );
    if (submittedVersion !== currentVersion) {
      throw new BadRequestException(
        'Reward-level configuration changed. Reload the product form.',
      );
    }

    const submitted =
      Array.isArray(payload.rewardShares) && payload.rewardShares.length > 0
        ? payload.rewardShares.map((raw) =>
            this.adminInputService.getObjectBody(raw),
          )
        : undefined;
    const defaults = [
      { depth: 0, shareBasisPoints: 1000 },
      ...levels.map((level) => ({
        depth: level.depth,
        shareBasisPoints:
          level.depth === 1 ? 6000 : level.depth === 2 ? 3000 : 0,
      })),
    ];
    const shares = submitted
      ? submitted.map((share) => ({
          depth: Math.trunc(this.adminInputService.getNumber(share.depth, -1)),
          shareBasisPoints: Math.trunc(
            'shareBasisPoints' in share
              ? this.adminInputService.getNumber(share.shareBasisPoints, -1)
              : this.adminInputService.getNumber(share.sharePercent, -1) * 100,
          ),
        }))
      : defaults;
    const expectedDepths = new Set([0, ...levels.map((level) => level.depth)]);
    if (
      shares.length !== expectedDepths.size ||
      new Set(shares.map((share) => share.depth)).size !== shares.length ||
      shares.some(
        (share) =>
          !expectedDepths.has(share.depth) ||
          share.shareBasisPoints < 0 ||
          share.shareBasisPoints > 10_000,
      )
    ) {
      throw new BadRequestException(
        'Reward shares do not match active level configuration',
      );
    }
    if (
      shares.reduce((sum, share) => sum + share.shareBasisPoints, 0) > 10_000
    ) {
      throw new BadRequestException('Reward shares must not exceed 100%');
    }

    for (const share of shares) {
      const level = levels.find((item) => item.depth === share.depth);
      await tx.productRewardShare.upsert({
        where: { productId_depth: { productId, depth: share.depth } },
        create: {
          productId,
          levelId: level?.id,
          depth: share.depth,
          shareBasisPoints: share.shareBasisPoints,
        },
        update: {
          levelId: level?.id,
          shareBasisPoints: share.shareBasisPoints,
        },
      });
    }
  }

  private async replaceProductLogistics(
    productId: string,
    payload: Record<string, unknown>,
    tx: Prisma.TransactionClient | PrismaService = this.prismaService,
  ) {
    if (!('logistics' in payload)) return;
    const logistics = this.adminInputService.getObjectBody(payload.logistics);
    const packagesInput = Array.isArray(logistics.packages)
      ? logistics.packages
      : [];
    const warehouseIds = Array.isArray(logistics.warehouseIds)
      ? logistics.warehouseIds.filter(
          (value): value is string =>
            typeof value === 'string' && Boolean(value),
        )
      : [];
    const serviceIds = Array.isArray(logistics.deliveryServiceIds)
      ? logistics.deliveryServiceIds.filter(
          (value): value is string =>
            typeof value === 'string' && Boolean(value),
        )
      : [];
    const primaryWarehouseId = this.adminInputService.getOptionalString(
      logistics.primaryWarehouseId,
    );
    if (
      new Set(warehouseIds).size !== warehouseIds.length ||
      new Set(serviceIds).size !== serviceIds.length
    ) {
      throw new BadRequestException('Duplicate logistics relation');
    }
    if (primaryWarehouseId && !warehouseIds.includes(primaryWarehouseId)) {
      throw new BadRequestException('Primary warehouse must be selected');
    }
    const [warehouses, services] = await Promise.all([
      tx.warehouse.findMany({ where: { id: { in: warehouseIds } } }),
      tx.deliveryService.findMany({
        where: { id: { in: serviceIds } },
        include: { provider: true },
      }),
    ]);
    if (warehouses.length !== warehouseIds.length)
      throw new BadRequestException('Unknown warehouse');
    if (services.length !== serviceIds.length)
      throw new BadRequestException('Unknown delivery service');
    if (
      primaryWarehouseId &&
      !warehouses.find((item) => item.id === primaryWarehouseId)?.isActive
    ) {
      throw new BadRequestException('Primary warehouse must be active');
    }
    if (services.some((item) => !item.isActive || !item.provider.isActive)) {
      throw new BadRequestException(
        'Inactive delivery service cannot be enabled',
      );
    }
    const packages = packagesInput.map((value, sequence) => {
      const item = this.adminInputService.getObjectBody(value);
      const type = Object.values(PackageType).includes(item.type as PackageType)
        ? (item.type as PackageType)
        : PackageType.BOX;
      return {
        sequence,
        name: this.adminInputService.getOptionalString(item.name),
        type,
        quantity: this.getPositiveInteger(item.quantity, 'Package quantity'),
        weightGrams: this.getPositiveInteger(
          item.weightGrams,
          'Package weight',
        ),
        lengthMillimeters: this.getPositiveInteger(
          item.lengthMillimeters,
          'Package length',
        ),
        widthMillimeters: this.getPositiveInteger(
          item.widthMillimeters,
          'Package width',
        ),
        heightMillimeters: this.getPositiveInteger(
          item.heightMillimeters,
          'Package height',
        ),
      };
    });
    if (serviceIds.length) {
      const primary = warehouses.find((item) => item.id === primaryWarehouseId);
      if (!packages.length || !primary?.isConfigured) {
        throw new BadRequestException(
          'Delivery services require valid packages and a configured primary warehouse',
        );
      }
    }
    await tx.productDeliveryService.deleteMany({ where: { productId } });
    await tx.productWarehouse.deleteMany({ where: { productId } });
    const currentProfile = await tx.productShippingProfile.findUnique({
      where: { productId },
    });
    if (currentProfile)
      await tx.productPackageProfile.deleteMany({
        where: { shippingProfileId: currentProfile.id },
      });
    const shouldHaveProfile =
      Boolean(logistics.shippingProfile) || packages.length > 0;
    if (shouldHaveProfile) {
      const profileInput = this.adminInputService.getObjectBody(
        logistics.shippingProfile,
      );
      const profile = await tx.productShippingProfile.upsert({
        where: { productId },
        create: {
          productId,
          isFragile: this.adminInputService.getBoolean(
            profileInput.isFragile,
            false,
          ),
          isStackable: this.adminInputService.getBoolean(
            profileInput.isStackable,
            true,
          ),
          ageRestricted: this.adminInputService.getBoolean(
            profileInput.ageRestricted,
            false,
          ),
          handlingNotes: this.adminInputService.getOptionalString(
            profileInput.handlingNotes,
          ),
        },
        update: {
          isFragile: this.adminInputService.getBoolean(
            profileInput.isFragile,
            false,
          ),
          isStackable: this.adminInputService.getBoolean(
            profileInput.isStackable,
            true,
          ),
          ageRestricted: this.adminInputService.getBoolean(
            profileInput.ageRestricted,
            false,
          ),
          handlingNotes: this.adminInputService.getOptionalString(
            profileInput.handlingNotes,
          ),
        },
      });
      for (const item of packages)
        await tx.productPackageProfile.create({
          data: { ...item, shippingProfileId: profile.id },
        });
    } else if (currentProfile) {
      await tx.productShippingProfile.delete({
        where: { id: currentProfile.id },
      });
    }
    for (const warehouseId of warehouseIds)
      await tx.productWarehouse.create({
        data: {
          productId,
          warehouseId,
          isPrimary: warehouseId === primaryWarehouseId,
          isActive: true,
        },
      });
    for (const deliveryServiceId of serviceIds)
      await tx.productDeliveryService.create({
        data: { productId, deliveryServiceId, isEnabled: true },
      });
    await tx.auditEvent.create({
      data: {
        action: 'PRODUCT_LOGISTICS_UPDATED',
        targetType: 'Product',
        targetId: productId,
        metadata: {
          packagesCount: packages.length,
          warehousesCount: warehouseIds.length,
          servicesCount: serviceIds.length,
        },
      },
    });
  }

  private getPositiveInteger(value: unknown, label: string) {
    const parsed = Math.trunc(
      this.adminInputService.getNumber(value, Number.NaN),
    );
    if (!Number.isSafeInteger(parsed) || parsed <= 0)
      throw new BadRequestException(`${label} must be positive`);
    return parsed;
  }

  private async assertUniqueSku(value: unknown, exceptId?: string) {
    const sku = this.adminInputService.getOptionalString(value);
    if (!sku) return;
    const existing = await this.prismaService.product.findFirst({
      where: { sku, id: exceptId ? { not: exceptId } : undefined },
      select: { id: true },
    });
    if (existing) throw new BadRequestException('SKU already exists');
  }

  private getOptionalNonnegativeInteger(value: unknown, label: string) {
    if (value == null || value === '') return null;
    const parsed = Math.trunc(
      this.adminInputService.getNumber(value, Number.NaN),
    );
    if (!Number.isSafeInteger(parsed) || parsed < 0)
      throw new BadRequestException(`${label} must be nonnegative`);
    return parsed;
  }

  private getProductLogisticsReadiness(product: AdminProductViewRecord) {
    const packages = product.shippingProfile?.packages ?? [];
    const packagesValid =
      packages.length > 0 &&
      packages.every((item) =>
        [
          item.quantity,
          item.weightGrams,
          item.lengthMillimeters,
          item.widthMillimeters,
          item.heightMillimeters,
        ].every((value) => value > 0),
      );
    const primary = (product.warehouses ?? []).find(
      (item) => item.isPrimary && item.isActive,
    );
    const warehouseReady = Boolean(
      primary?.warehouse?.isActive && primary?.warehouse?.isConfigured,
    );
    const serviceReady = (product.deliveryServices ?? []).some(
      (item) =>
        item.isEnabled &&
        item.deliveryService?.isActive &&
        item.deliveryService?.provider?.isActive,
    );
    if (
      product.shippingProfile &&
      packagesValid &&
      warehouseReady &&
      serviceReady
    )
      return 'READY';
    if (
      product.shippingProfile ||
      packages.length ||
      product.warehouses?.length ||
      product.deliveryServices?.length
    )
      return 'PARTIAL';
    return 'NOT_CONFIGURED';
  }

  private mapMarketCategory(category: any, categoryById: Map<string, any>) {
    const path: string[] = [];
    const visitedCategoryIds = new Set<string>();
    let currentCategory = category;

    while (currentCategory && !visitedCategoryIds.has(currentCategory.id)) {
      visitedCategoryIds.add(currentCategory.id);
      path.unshift(currentCategory.slug);
      currentCategory = currentCategory.parentId
        ? categoryById.get(currentCategory.parentId)
        : undefined;
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      path: path.join('/'),
      sortOrder: category.sortOrder,
      description: category.description ?? undefined,
      parentId: category.parentId ?? undefined,
      image: category.image ?? undefined,
      isActive: category.isActive,
      isOversized: category.isOversized,
      deletedAt: category.deletedAt,
      productsCount: category._count?.products ?? 0,
    };
  }

  private getNullableBoolean(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
  }
}
