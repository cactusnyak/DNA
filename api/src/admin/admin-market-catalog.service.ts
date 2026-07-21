import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CatalogCollectionType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { AdminInputService } from './admin-input.service';

@Injectable()
export class AdminMarketCatalogService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly adminInputService: AdminInputService,
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
        description: this.adminInputService.getOptionalString(payload.description),
        parentId,
        imageId: await this.createImageFromPayload(payload),
        sortOrder: this.adminInputService.getNumber(payload.sortOrder, 0),
        isActive: this.adminInputService.getBoolean(payload.isActive, true),
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
        description: this.adminInputService.getOptionalString(payload.description),
        parentId,
        imageId: await this.resolveImageFromPayload(payload, currentCategory.imageId),
        sortOrder: this.adminInputService.getNumber(payload.sortOrder, 0),
        isActive: this.adminInputService.getBoolean(payload.isActive, true),
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

    const product = await this.prismaService.product.create({
      data: {
        title,
        slug: await this.adminInputService.getUniqueSlug({
          entity: 'product',
          value: payload.slug,
          fallback: title,
        }),
        categoryId,
        description: this.adminInputService.getOptionalString(payload.description) ?? '',
        price: this.adminInputService.getNumber(payload.price, 0),
        isActive: this.adminInputService.getBoolean(payload.isActive, true),
      },
    });

    await this.replaceProductImages(
      product.id,
      this.adminInputService.getImageUrls(payload),
    );

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

    await this.prismaService.product.update({
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
        description: this.adminInputService.getOptionalString(payload.description) ?? '',
        price: this.adminInputService.getNumber(payload.price, 0),
        isActive: this.adminInputService.getBoolean(payload.isActive, true),
      },
    });

    if ('imageUrls' in payload) {
      await this.replaceProductImages(
        id,
        this.adminInputService.getImageUrls(payload),
      );
    }

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
        description: this.adminInputService.getOptionalString(payload.description),
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
        description: this.adminInputService.getOptionalString(payload.description),
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
      include: {
        category: { include: this.categoryInclude },
        images: { include: { image: true } },
      },
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
    const [orderItemsCount, cartItemsCount, collectionProductsCount] =
      await Promise.all([
        this.prismaService.orderItem.count({ where: { productId: id } }),
        this.prismaService.cartItem.count({ where: { productId: id } }),
        this.prismaService.catalogCollectionProduct.count({
          where: { productId: id },
        }),
      ]);
    const blockers: string[] = [];

    if (orderItemsCount > 0) blockers.push('продукт есть в заказах');
    if (cartItemsCount > 0) blockers.push('продукт есть в корзинах пользователей');
    if (collectionProductsCount > 0)
      blockers.push('продукт используется в подборках');

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
      const parentCategory = await this.prismaService.marketCategory.findUnique({
        where: { id: currentParentId },
        select: { id: true, parentId: true },
      });

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

  private mapProduct(product: any, categoryById: Map<string, any>) {
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
      isActive: product.isActive,
      deletedAt: product.deletedAt,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      images: (product.images ?? [])
        .map((productImage: any) => productImage.image)
        .sort(
          (firstImage: any, secondImage: any) =>
            firstImage.sortOrder - secondImage.sortOrder,
        ),
    };
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
      deletedAt: category.deletedAt,
      productsCount: category._count?.products ?? 0,
    };
  }
}
