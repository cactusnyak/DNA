import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import {
  CatalogCollectionType,
  OrderStatus,
} from '@prisma/client';

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

type CollectionItemPayload = {
  id: string;
  sortOrder?: number;
};

export type AdminUploadedImageFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
};

const MAX_IMAGE_UPLOAD_SIZE = 5 * 1024 * 1024;

const IMAGE_MIME_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) { }

  async getOverview() {
    const [
      usersCount,
      categoriesCount,
      productsCount,
      collectionsCount,
      ordersCount,
    ] = await this.prismaService.$transaction([
      this.prismaService.user.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.category.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.product.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.catalogCollection.count(),
      this.prismaService.order.count(),
    ]);

    return {
      usersCount,
      categoriesCount,
      productsCount,
      collectionsCount,
      ordersCount,
    };
  }


  async uploadImage(file?: AdminUploadedImageFile) {
    if (!file?.buffer) {
      throw new BadRequestException('Image file is required');
    }

    if (!IMAGE_MIME_EXTENSION[file.mimetype]) {
      throw new BadRequestException('Unsupported image file type');
    }

    if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
      throw new BadRequestException('Image file is too large');
    }

    const fileExtension = this.getImageUploadExtension(file);
    const fileName = `${randomUUID()}${fileExtension}`;
    const uploadsDirectory = join(process.cwd(), 'uploads', 'images');
    const filePath = join(uploadsDirectory, fileName);

    await mkdir(uploadsDirectory, {
      recursive: true,
    });

    await writeFile(filePath, file.buffer);

    return {
      url: `/uploads/images/${fileName}`,
      fileName,
    };
  }

  async getCatalog() {
    const categories = await this.prismaService.category.findMany({
      include: {
        image: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: [
        {
          sortOrder: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });

    const categoryById = new Map(
      categories.map((category) => [category.id, category]),
    );

    const [products, collections, orders] = await Promise.all([
      this.prismaService.product.findMany({
        include: {
          category: {
            include: {
              image: true,
            },
          },
          images: {
            include: {
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.catalogCollection.findMany({
        include: {
          categories: {
            include: {
              category: {
                include: {
                  image: true,
                  _count: {
                    select: {
                      products: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
          products: {
            include: {
              product: {
                include: {
                  category: {
                    include: {
                      image: true,
                    },
                  },
                  images: {
                    include: {
                      image: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.order.findMany({
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      categories: categories.map((category) =>
        this.mapCategory(category, categoryById),
      ),
      products: products.map((product) =>
        this.mapProduct(product, categoryById),
      ),
      collections: collections.map((collection) =>
        this.mapCatalogCollection(collection, categoryById),
      ),
      orders: orders.map((order) => this.mapOrder(order)),
    };
  }

  async createCategory(body: unknown) {
    const payload = this.getObjectBody(body);
    const name = this.getRequiredString(payload.name, 'Category name is required');
    const slug = await this.getUniqueSlug({
      entity: 'category',
      value: payload.slug,
      fallback: name,
    });
    const imageId = await this.createImageFromPayload(payload);

    const category = await this.prismaService.category.create({
      data: {
        name,
        slug,
        description: this.getOptionalString(payload.description),
        parentId: this.getOptionalString(payload.parentId),
        imageId,
        sortOrder: this.getNumber(payload.sortOrder, 0),
        isActive: this.getBoolean(payload.isActive, true),
      },
      include: {
        image: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return this.mapCategory(category, new Map([[category.id, category]]));
  }

  async updateCategory(id: string, body: unknown) {
    const currentCategory = await this.getCategoryOrThrow(id);
    const payload = this.getObjectBody(body);
    const name = this.getRequiredString(payload.name, 'Category name is required');
    const slug = await this.getUniqueSlug({
      entity: 'category',
      value: payload.slug,
      fallback: name,
      exceptId: id,
    });
    const imageId = await this.resolveImageFromPayload(
      payload,
      currentCategory.imageId,
    );

    const category = await this.prismaService.category.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
        description: this.getOptionalString(payload.description),
        parentId: this.getOptionalString(payload.parentId),
        imageId,
        sortOrder: this.getNumber(payload.sortOrder, 0),
        isActive: this.getBoolean(payload.isActive, true),
      },
      include: {
        image: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const categories = await this.prismaService.category.findMany({
      include: {
        image: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const categoryById = new Map(
      categories.map((categoryItem) => [categoryItem.id, categoryItem]),
    );

    return this.mapCategory(category, categoryById);
  }

  async deleteCategory(id: string) {
    await this.getCategoryOrThrow(id);

    return this.prismaService.category.update({
      where: {
        id,
      },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  async restoreCategory(id: string) {
    await this.getCategoryOrThrow(id);

    return this.prismaService.category.update({
      where: {
        id,
      },
      data: {
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async createProduct(body: unknown) {
    const payload = this.getObjectBody(body);
    const title = this.getRequiredString(payload.title, 'Product title is required');
    const categoryId = this.getRequiredString(
      payload.categoryId,
      'Product category is required',
    );

    await this.getCategoryOrThrow(categoryId);

    const slug = await this.getUniqueSlug({
      entity: 'product',
      value: payload.slug,
      fallback: title,
    });

    const product = await this.prismaService.product.create({
      data: {
        title,
        slug,
        categoryId,
        description: this.getOptionalString(payload.description) ?? '',
        price: this.getNumber(payload.price, 0),
        isActive: this.getBoolean(payload.isActive, true),
      },
    });

    await this.replaceProductImages(product.id, this.getImageUrls(payload));

    return this.getAdminProductById(product.id);
  }

  async updateProduct(id: string, body: unknown) {
    await this.getProductOrThrow(id);

    const payload = this.getObjectBody(body);
    const title = this.getRequiredString(payload.title, 'Product title is required');
    const categoryId = this.getRequiredString(
      payload.categoryId,
      'Product category is required',
    );

    await this.getCategoryOrThrow(categoryId);

    const slug = await this.getUniqueSlug({
      entity: 'product',
      value: payload.slug,
      fallback: title,
      exceptId: id,
    });

    await this.prismaService.product.update({
      where: {
        id,
      },
      data: {
        title,
        slug,
        categoryId,
        description: this.getOptionalString(payload.description) ?? '',
        price: this.getNumber(payload.price, 0),
        isActive: this.getBoolean(payload.isActive, true),
      },
    });

    if ('imageUrls' in payload) {
      await this.replaceProductImages(id, this.getImageUrls(payload));
    }

    return this.getAdminProductById(id);
  }

  async deleteProduct(id: string) {
    await this.getProductOrThrow(id);

    return this.prismaService.product.update({
      where: {
        id,
      },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  async restoreProduct(id: string) {
    await this.getProductOrThrow(id);

    return this.prismaService.product.update({
      where: {
        id,
      },
      data: {
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async createCatalogCollection(body: unknown) {
    const payload = this.getObjectBody(body);
    const title = this.getRequiredString(
      payload.title,
      'Collection title is required',
    );
    const type = this.getCollectionType(payload.type);
    const slug = await this.getUniqueSlug({
      entity: 'collection',
      value: payload.slug,
      fallback: title,
    });

    return this.prismaService.catalogCollection.create({
      data: {
        title,
        slug,
        type,
        description: this.getOptionalString(payload.description),
        isActive: this.getBoolean(payload.isActive, true),
      },
    });
  }

  async updateCatalogCollection(id: string, body: unknown) {
    await this.getCatalogCollectionOrThrow(id);

    const payload = this.getObjectBody(body);
    const title = this.getRequiredString(
      payload.title,
      'Collection title is required',
    );
    const type = this.getCollectionType(payload.type);
    const slug = await this.getUniqueSlug({
      entity: 'collection',
      value: payload.slug,
      fallback: title,
      exceptId: id,
    });

    return this.prismaService.catalogCollection.update({
      where: {
        id,
      },
      data: {
        title,
        slug,
        type,
        description: this.getOptionalString(payload.description),
        isActive: this.getBoolean(payload.isActive, true),
      },
    });
  }

  async deleteCatalogCollection(id: string) {
    await this.getCatalogCollectionOrThrow(id);

    return this.prismaService.catalogCollection.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  }

  async restoreCatalogCollection(id: string) {
    await this.getCatalogCollectionOrThrow(id);

    return this.prismaService.catalogCollection.update({
      where: {
        id,
      },
      data: {
        isActive: true,
      },
    });
  }

  async updateCatalogCollectionCategories(id: string, body: unknown) {
    const collection = await this.getCatalogCollectionOrThrow(id);

    if (collection.type !== CatalogCollectionType.CATEGORY) {
      throw new BadRequestException('Collection is not a category collection');
    }

    const items = this.getCollectionItems(body);

    await this.prismaService.$transaction([
      this.prismaService.catalogCollectionCategory.deleteMany({
        where: {
          collectionId: id,
        },
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
        where: {
          collectionId: id,
        },
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

  async updateOrderStatus(id: string, body: unknown) {
    const payload = this.getObjectBody(body);

    if (
      typeof payload.status !== 'string' ||
      !Object.values(OrderStatus).includes(payload.status as OrderStatus)
    ) {
      throw new BadRequestException('Invalid order status');
    }

    return this.prismaService.order.update({
      where: {
        id,
      },
      data: {
        status: payload.status as OrderStatus,
      },
    });
  }

  private async getAdminProductById(id: string) {
    const categories = await this.prismaService.category.findMany({
      include: {
        image: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const categoryById = new Map(
      categories.map((categoryItem) => [categoryItem.id, categoryItem]),
    );

    const product = await this.prismaService.product.findUnique({
      where: {
        id,
      },
      include: {
        category: {
          include: {
            image: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
        },
        images: {
          include: {
            image: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapProduct(product, categoryById);
  }

  private async getCatalogCollectionById(id: string) {
    const categories = await this.prismaService.category.findMany({
      include: {
        image: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const categoryById = new Map(
      categories.map((categoryItem) => [categoryItem.id, categoryItem]),
    );

    const collection = await this.prismaService.catalogCollection.findUnique({
      where: {
        id,
      },
      include: {
        categories: {
          include: {
            category: {
              include: {
                image: true,
                _count: {
                  select: {
                    products: true,
                  },
                },
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        products: {
          include: {
            product: {
              include: {
                category: {
                  include: {
                    image: true,
                  },
                },
                images: {
                  include: {
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return this.mapCatalogCollection(collection, categoryById);
  }

  private async getCategoryOrThrow(id: string) {
    const category = await this.prismaService.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  private async getProductOrThrow(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  private async getCatalogCollectionOrThrow(id: string) {
    const collection = await this.prismaService.catalogCollection.findUnique({
      where: {
        id,
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  private async resolveImageFromPayload(
    payload: Record<string, unknown>,
    currentImageId?: string | null,
  ) {
    if (!('imageUrl' in payload)) {
      return currentImageId ?? null;
    }

    const imageUrl = this.getOptionalString(payload.imageUrl);

    if (!imageUrl) {
      return null;
    }

    const alt = this.getOptionalString(payload.imageAlt);

    if (currentImageId) {
      const image = await this.prismaService.image.update({
        where: {
          id: currentImageId,
        },
        data: {
          url: imageUrl,
          alt,
        },
      });

      return image.id;
    }

    return this.createImageFromPayload(payload);
  }

  private async createImageFromPayload(payload: Record<string, unknown>) {
    const imageUrl = this.getOptionalString(payload.imageUrl);

    if (!imageUrl) {
      return null;
    }

    const image = await this.prismaService.image.create({
      data: {
        url: imageUrl,
        alt: this.getOptionalString(payload.imageAlt),
        sortOrder: 0,
      },
    });

    return image.id;
  }

  private async replaceProductImages(productId: string, imageUrls: string[]) {
    await this.prismaService.productImage.deleteMany({
      where: {
        productId,
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

        return this.prismaService.productImage.create({
          data: {
            productId,
            imageId: image.id,
          },
        });
      }),
    );
  }

  private getCategoryPath(category: any, categoryById: Map<string, any>) {
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
      isActive: category.isActive,
      deletedAt: category.deletedAt,
      productsCount: category._count?.products ?? 0,
    };
  }

  private mapProduct(product: any, categoryById: Map<string, any>) {
    return {
      id: product.id,
      categoryId: product.categoryId,
      category: product.category
        ? this.mapCategory(product.category, categoryById)
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

  private mapCatalogCollection(collection: any, categoryById: Map<string, any>) {
    return {
      id: collection.id,
      slug: collection.slug,
      type: collection.type,
      title: collection.title,
      description: collection.description ?? undefined,
      isActive: collection.isActive,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      categories: (collection.categories ?? []).map((item: any) => ({
        sortOrder: item.sortOrder,
        category: this.mapCategory(item.category, categoryById),
      })),
      products: (collection.products ?? []).map((item: any) => ({
        sortOrder: item.sortOrder,
        product: this.mapProduct(item.product, categoryById),
      })),
    };
  }

  private mapOrder(order: any) {
    return {
      id: order.id,
      userId: order.userId ?? undefined,
      guestSessionId: order.guestSessionId ?? undefined,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail ?? undefined,
      deliveryAddress: order.deliveryAddress,
      comment: order.comment ?? undefined,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        product: item.product
          ? {
            id: item.product.id,
            title: item.product.title,
            slug: item.product.slug,
          }
          : undefined,
      })),
    };
  }


  private getImageUploadExtension(file: AdminUploadedImageFile) {
    const extensionFromMimeType = IMAGE_MIME_EXTENSION[file.mimetype];

    if (extensionFromMimeType) {
      return extensionFromMimeType;
    }

    const extensionFromName = extname(file.originalname).toLowerCase();

    return extensionFromName || '.jpg';
  }

  private getCollectionItems(body: unknown): CollectionItemPayload[] {
    const payload = this.getObjectBody(body);
    const rawItems = Array.isArray(payload.items) ? payload.items : [];

    return rawItems
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return undefined;
        }

        const itemRecord = item as Record<string, unknown>;
        const id = this.getOptionalString(itemRecord.id);

        if (!id) {
          return undefined;
        }

        return {
          id,
          sortOrder: this.getNumber(itemRecord.sortOrder, 0),
        };
      })
      .filter(Boolean) as CollectionItemPayload[];
  }

  private getImageUrls(payload: Record<string, unknown>) {
    if (Array.isArray(payload.imageUrls)) {
      return payload.imageUrls
        .map((value) => this.getOptionalString(value))
        .filter(Boolean) as string[];
    }

    const imageUrlsText = this.getOptionalString(payload.imageUrls);

    if (!imageUrlsText) {
      return [];
    }

    return imageUrlsText
      .split('\n')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  private getObjectBody(body: unknown) {
    if (!body || typeof body !== 'object') {
      return {};
    }

    return body as Record<string, unknown>;
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

  private getBoolean(value: unknown, fallback: boolean) {
    if (typeof value === 'boolean') {
      return value;
    }

    return fallback;
  }

  private getCollectionType(value: unknown) {
    return value === CatalogCollectionType.PRODUCT
      ? CatalogCollectionType.PRODUCT
      : CatalogCollectionType.CATEGORY;
  }

  private async getUniqueSlug(params: {
    entity: 'category' | 'product' | 'collection';
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

  private async isSlugBusy(
    entity: 'category' | 'product' | 'collection',
    slug: string,
    exceptId?: string,
  ) {
    if (entity === 'category') {
      const category = await this.prismaService.category.findFirst({
        where: {
          slug,
          deletedAt: null,
          id: exceptId
            ? {
              not: exceptId,
            }
            : undefined,
        },
      });

      return Boolean(category);
    }

    if (entity === 'product') {
      const product = await this.prismaService.product.findFirst({
        where: {
          slug,
          deletedAt: null,
          id: exceptId
            ? {
              not: exceptId,
            }
            : undefined,
        },
      });

      return Boolean(product);
    }

    const collection = await this.prismaService.catalogCollection.findFirst({
      where: {
        slug,
        id: exceptId
          ? {
            not: exceptId,
          }
          : undefined,
      },
    });

    return Boolean(collection);
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
