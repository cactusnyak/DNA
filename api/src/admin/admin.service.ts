import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import {
  AdStatus,
  CatalogCollectionType,
  OrderStatus,
  UserRole,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

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
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
  ) { }

  async getOverview() {
    const [
      usersCount,
      marketCategoriesCount,
      productsCount,
      collectionsCount,
      ordersCount,
      adCategoriesCount,
      adsCount,
    ] = await this.prismaService.$transaction([
      this.prismaService.user.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.marketCategory.count({
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
      this.prismaService.adCategory.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.ad.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    return {
      usersCount,
      marketCategoriesCount,
      productsCount,
      collectionsCount,
      ordersCount,
      adCategoriesCount,
      adsCount,
    };
  }


  async getReferrals(): Promise<object[]> {
    const users = await this.prismaService.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        nickname: true,
        nicknameSuffix: true,
        email: true,
        phone: true,
        role: true,
        referralCode: true,
        createdAt: true,
        receivedReferral: {
          select: { inviterUserId: true },
        },
        invitedReferrals: {
          select: {
            createdAt: true,
            invited: {
              select: {
                id: true,
                nickname: true,
                nicknameSuffix: true,
                email: true,
                deletedAt: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    type FlatUser = (typeof users)[number];

    const byId = new Map<string, FlatUser>(users.map((u) => [u.id, u]));

    type TreeNode = {
      id: string; nickname: string; nicknameSuffix?: string; email: string;
      phone: string | null; role: string; referralCode: string | null;
      createdAt: Date; deletedAt: null; invitedBy: string | null;
      directReferralsCount: number; directReferrals: TreeNode[];
    };

    function buildNode(user: FlatUser, inviterChain: string | null, visited: Set<string>): TreeNode {
      const children: TreeNode[] = user.invitedReferrals
        .filter((r) => !visited.has(r.invited.id))
        .map((r) => {
          const childUser = byId.get(r.invited.id);
          if (!childUser) return null;
          const next = new Set(visited);
          next.add(r.invited.id);
          return buildNode(childUser, inviterChain
            ? `${inviterChain} → ${user.nickname}`.trim()
            : (user.nickname.trim() || user.email), next);
        })
        .filter((n): n is TreeNode => n !== null);

      return {
        id: user.id,
        nickname: user.nickname,
        nicknameSuffix: user.nicknameSuffix,
        email: user.email,
        phone: user.phone,
        role: user.role,
        referralCode: user.referralCode,
        createdAt: user.createdAt,
        deletedAt: null,
        invitedBy: inviterChain,
        directReferralsCount: children.length,
        directReferrals: children,
      };
    }

    const rootUsers = users.filter((u) => !u.receivedReferral);

    return rootUsers.map((user) => buildNode(user, null, new Set([user.id])));
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
    const categories = await this.prismaService.marketCategory.findMany({
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

    const adCategories = await this.prismaService.adCategory.findMany({
      include: {
        image: true,
        _count: {
          select: {
            ads: true,
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

    const adCategoryById = new Map(
      adCategories.map((adCategory) => [adCategory.id, adCategory]),
    );

    const [ads, users] = await Promise.all([
      this.prismaService.ad.findMany({
        include: {
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.user.findMany({
        include: {
          avatar: true,
          _count: {
            select: {
              ads: true,
              orders: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      marketCategories: categories.map((category) =>
        this.mapMarketCategory(category, categoryById),
      ),
      products: products.map((product) =>
        this.mapProduct(product, categoryById),
      ),
      collections: collections.map((collection) =>
        this.mapCatalogCollection(collection, categoryById),
      ),
      orders: orders.map((order) => this.mapOrder(order)),
      adCategories: adCategories.map((adCategory) =>
        this.mapAdCategory(adCategory, adCategoryById),
      ),
      ads: ads.map((ad) => this.mapAd(ad, adCategoryById)),
      users: users.map((user) => this.mapAdminUser(user)),
    };
  }

  async createCategory(body: unknown) {
    const payload = this.getObjectBody(body);
    const name = this.getRequiredString(payload.name, 'Category name is required');
    const parentId = this.getOptionalString(payload.parentId);
    const slug = await this.getUniqueSlug({
      entity: 'marketCategory',
      value: payload.slug,
      fallback: name,
    });
    await this.assertValidMarketCategoryParent(parentId);
    const imageId = await this.createImageFromPayload(payload);

    const category = await this.prismaService.marketCategory.create({
      data: {
        name,
        slug,
        description: this.getOptionalString(payload.description),
        parentId,
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

    return this.mapMarketCategory(category, new Map([[category.id, category]]));
  }

  async updateCategory(id: string, body: unknown) {
    const currentCategory = await this.getCategoryOrThrow(id);
    const payload = this.getObjectBody(body);
    const name = this.getRequiredString(payload.name, 'Category name is required');
    const parentId = this.getOptionalString(payload.parentId);
    const slug = await this.getUniqueSlug({
      entity: 'marketCategory',
      value: payload.slug,
      fallback: name,
      exceptId: id,
    });
    await this.assertValidMarketCategoryParent(parentId, id);
    const imageId = await this.resolveImageFromPayload(
      payload,
      currentCategory.imageId,
    );

    const category = await this.prismaService.marketCategory.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
        description: this.getOptionalString(payload.description),
        parentId,
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

    const categories = await this.prismaService.marketCategory.findMany({
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

    return this.mapMarketCategory(category, categoryById);
  }

  async deleteCategory(id: string) {
    await this.getCategoryOrThrow(id);

    return this.prismaService.marketCategory.update({
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

    return this.prismaService.marketCategory.update({
      where: {
        id,
      },
      data: {
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async hardDeleteCategory(id: string) {
    await this.getCategoryOrThrow(id);
    await this.assertCategoryCanBeHardDeleted(id);

    return this.prismaService.marketCategory.delete({
      where: {
        id,
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

  async hardDeleteProduct(id: string) {
    await this.getProductOrThrow(id);
    await this.assertProductCanBeHardDeleted(id);

    return this.prismaService.$transaction(async (transaction) => {
      await transaction.productImage.deleteMany({
        where: {
          productId: id,
        },
      });

      return transaction.product.delete({
        where: {
          id,
        },
      });
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

  async hardDeleteCatalogCollection(id: string) {
    await this.getCatalogCollectionOrThrow(id);

    return this.prismaService.catalogCollection.delete({
      where: {
        id,
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

  async hardDeleteOrder(id: string) {
    await this.getOrderOrThrow(id);

    return this.prismaService.$transaction(async (transaction) => {
      await transaction.referralReward.deleteMany({
        where: {
          orderId: id,
        },
      });

      await transaction.orderItem.deleteMany({
        where: {
          orderId: id,
        },
      });

      return transaction.order.delete({
        where: {
          id,
        },
      });
    });
  }

  private async getAdminProductById(id: string) {
    const categories = await this.prismaService.marketCategory.findMany({
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
    const categories = await this.prismaService.marketCategory.findMany({
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
    const category = await this.prismaService.marketCategory.findUnique({
      where: {
        id,
      },
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
        where: {
          id: currentParentId,
        },
        select: {
          id: true,
          parentId: true,
        },
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

  private async getOrderOrThrow(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
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
    const visitedCategoryIds = new Set<string>();

    while (currentCategory) {
      if (visitedCategoryIds.has(currentCategory.id)) {
        break;
      }

      visitedCategoryIds.add(currentCategory.id);
      parts.unshift(currentCategory.slug);

      if (!currentCategory.parentId) {
        break;
      }

      currentCategory = categoryById.get(currentCategory.parentId);
    }

    return parts.join('/');
  }

  private mapMarketCategory(category: any, categoryById: Map<string, any>) {
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
        category: this.mapMarketCategory(item.category, categoryById),
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



  private async assertCategoryCanBeHardDeleted(id: string) {
    const [
      childrenCount,
      productsCount,
      collectionCategoriesCount,
    ] = await Promise.all([
      this.prismaService.marketCategory.count({
        where: {
          parentId: id,
        },
      }),
      this.prismaService.product.count({
        where: {
          categoryId: id,
        },
      }),
      this.prismaService.catalogCollectionCategory.count({
        where: {
          categoryId: id,
        },
      }),
    ]);

    const blockers: string[] = [];

    if (childrenCount > 0) {
      blockers.push('есть дочерние категории');
    }

    if (productsCount > 0) {
      blockers.push('есть связанные продукты');
    }

    if (collectionCategoriesCount > 0) {
      blockers.push('категория используется в подборках');
    }

    if (blockers.length) {
      throw new BadRequestException(
        `Категорию нельзя удалить навсегда: ${blockers.join(', ')}.`,
      );
    }
  }

  private async assertProductCanBeHardDeleted(id: string) {
    const [
      orderItemsCount,
      cartItemsCount,
      collectionProductsCount,
    ] = await Promise.all([
      this.prismaService.orderItem.count({
        where: {
          productId: id,
        },
      }),
      this.prismaService.cartItem.count({
        where: {
          productId: id,
        },
      }),
      this.prismaService.catalogCollectionProduct.count({
        where: {
          productId: id,
        },
      }),
    ]);

    const blockers: string[] = [];

    if (orderItemsCount > 0) {
      blockers.push('продукт есть в заказах');
    }

    if (cartItemsCount > 0) {
      blockers.push('продукт есть в корзинах пользователей');
    }

    if (collectionProductsCount > 0) {
      blockers.push('продукт используется в подборках');
    }

    if (blockers.length) {
      throw new BadRequestException(
        `Продукт нельзя удалить навсегда: ${blockers.join(', ')}.`,
      );
    }
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
    entity: 'marketCategory' | 'product' | 'collection' | 'adCategory' | 'ad';
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
    entity: 'marketCategory' | 'product' | 'collection' | 'adCategory' | 'ad',
    slug: string,
    exceptId?: string,
  ) {
    if (entity === 'marketCategory') {
      const category = await this.prismaService.marketCategory.findFirst({
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

    if (entity === 'adCategory') {
      const adCategory = await this.prismaService.adCategory.findFirst({
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

      return Boolean(adCategory);
    }

    if (entity === 'ad') {
      const ad = await this.prismaService.ad.findFirst({
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

      return Boolean(ad);
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

  // ===== Ad categories =====

  async createAdCategory(body: unknown) {
    const payload = this.getObjectBody(body);
    const name = this.getRequiredString(
      payload.name,
      'Ad category name is required',
    );
    const parentId = this.getOptionalString(payload.parentId);
    const slug = await this.getUniqueSlug({
      entity: 'adCategory',
      value: payload.slug,
      fallback: name,
    });
    await this.assertValidAdCategoryParent(parentId);
    const imageId = await this.createImageFromPayload(payload);

    const adCategory = await this.prismaService.adCategory.create({
      data: {
        name,
        slug,
        description: this.getOptionalString(payload.description),
        parentId,
        imageId,
        sortOrder: this.getNumber(payload.sortOrder, 0),
        isActive: this.getBoolean(payload.isActive, true),
      },
      include: {
        image: true,
        _count: {
          select: {
            ads: true,
          },
        },
      },
    });

    return this.mapAdCategory(adCategory, new Map([[adCategory.id, adCategory]]));
  }

  async updateAdCategory(id: string, body: unknown) {
    const currentAdCategory = await this.getAdCategoryOrThrow(id);
    const payload = this.getObjectBody(body);
    const name = this.getRequiredString(
      payload.name,
      'Ad category name is required',
    );
    const parentId = this.getOptionalString(payload.parentId);
    const slug = await this.getUniqueSlug({
      entity: 'adCategory',
      value: payload.slug,
      fallback: name,
      exceptId: id,
    });
    await this.assertValidAdCategoryParent(parentId, id);
    const imageId = await this.resolveImageFromPayload(
      payload,
      currentAdCategory.imageId,
    );

    const adCategory = await this.prismaService.adCategory.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
        description: this.getOptionalString(payload.description),
        parentId,
        imageId,
        sortOrder: this.getNumber(payload.sortOrder, 0),
        isActive: this.getBoolean(payload.isActive, true),
      },
      include: {
        image: true,
        _count: {
          select: {
            ads: true,
          },
        },
      },
    });

    const adCategories = await this.prismaService.adCategory.findMany({
      include: {
        image: true,
        _count: {
          select: {
            ads: true,
          },
        },
      },
    });

    const adCategoryById = new Map(
      adCategories.map((adCategoryItem) => [adCategoryItem.id, adCategoryItem]),
    );

    return this.mapAdCategory(adCategory, adCategoryById);
  }

  async deleteAdCategory(id: string) {
    await this.getAdCategoryOrThrow(id);

    return this.prismaService.adCategory.update({
      where: {
        id,
      },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  async restoreAdCategory(id: string) {
    await this.getAdCategoryOrThrow(id);

    return this.prismaService.adCategory.update({
      where: {
        id,
      },
      data: {
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async hardDeleteAdCategory(id: string) {
    await this.getAdCategoryOrThrow(id);
    await this.assertAdCategoryCanBeHardDeleted(id);

    return this.prismaService.adCategory.delete({
      where: {
        id,
      },
    });
  }

  // ===== Ads (moderation & management) =====

  async updateAd(id: string, body: unknown) {
    await this.getAdOrThrow(id);

    const payload = this.getObjectBody(body);
    const title = this.getRequiredString(payload.title, 'Ad title is required');
    const categoryId = this.getRequiredString(
      payload.categoryId,
      'Ad category is required',
    );

    await this.getAdCategoryOrThrow(categoryId);

    const slug = await this.getUniqueSlug({
      entity: 'ad',
      value: payload.slug,
      fallback: title,
      exceptId: id,
    });

    const status = this.getAdStatus(payload.status);

    await this.prismaService.ad.update({
      where: {
        id,
      },
      data: {
        title,
        slug,
        categoryId,
        description: this.getOptionalString(payload.description) ?? '',
        price: this.getNumber(payload.price, 0),
        status,
        moderatedAt: new Date(),
        isActive: this.getBoolean(payload.isActive, true),
        contactPhone: this.getOptionalString(payload.contactPhone),
        contactTelegram: this.getOptionalString(payload.contactTelegram),
        contactEmail: this.getOptionalString(payload.contactEmail),
        contactOther: this.getOptionalString(payload.contactOther),
      },
    });

    if ('imageUrls' in payload) {
      await this.replaceAdImages(id, this.getImageUrls(payload));
    }

    return this.getAdminAdById(id);
  }

  async deleteAd(id: string) {
    await this.getAdOrThrow(id);

    return this.prismaService.ad.update({
      where: {
        id,
      },
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
      where: {
        id,
      },
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
      await transaction.adImage.deleteMany({
        where: {
          adId: id,
        },
      });

      return transaction.ad.delete({
        where: {
          id,
        },
      });
    });
  }

  // ===== Users =====

  async updateUserRole(id: string, body: unknown) {
    await this.getUserOrThrow(id);

    const payload = this.getObjectBody(body);

    if (
      typeof payload.role !== 'string' ||
      !Object.values(UserRole).includes(payload.role as UserRole)
    ) {
      throw new BadRequestException('Invalid user role');
    }

    await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        role: payload.role as UserRole,
      },
    });

    return this.getAdminUserById(id);
  }

  async deleteUser(id: string) {
    await this.getUserOrThrow(id);

    await this.usersService.softDeleteById(id);

    return this.getAdminUserById(id);
  }

  // ===== Ads helpers =====

  private async getAdminAdById(id: string) {
    const adCategories = await this.prismaService.adCategory.findMany({
      include: {
        image: true,
        _count: {
          select: {
            ads: true,
          },
        },
      },
    });

    const adCategoryById = new Map(
      adCategories.map((adCategoryItem) => [adCategoryItem.id, adCategoryItem]),
    );

    const ad = await this.prismaService.ad.findUnique({
      where: {
        id,
      },
      include: {
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
      },
    });

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    return this.mapAd(ad, adCategoryById);
  }

  private async getAdminUserById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        avatar: true,
        _count: {
          select: {
            ads: true,
            orders: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapAdminUser(user);
  }

  private async getAdCategoryOrThrow(id: string) {
    const adCategory = await this.prismaService.adCategory.findUnique({
      where: {
        id,
      },
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
    if (!parentId) {
      return;
    }

    if (parentId === categoryId) {
      throw new BadRequestException('Ad category cannot be its own parent');
    }

    const visitedCategoryIds = new Set<string>();
    let currentParentId: string | null | undefined = parentId;

    while (currentParentId) {
      if (visitedCategoryIds.has(currentParentId)) {
        throw new BadRequestException(
          'Ad category parent tree contains a cycle',
        );
      }

      visitedCategoryIds.add(currentParentId);

      const parentCategory = await this.prismaService.adCategory.findUnique({
        where: {
          id: currentParentId,
        },
        select: {
          id: true,
          parentId: true,
        },
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

  private async getAdOrThrow(id: string) {
    const ad = await this.prismaService.ad.findUnique({
      where: {
        id,
      },
    });

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    return ad;
  }

  private async getUserOrThrow(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
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

  private async assertAdCategoryCanBeHardDeleted(id: string) {
    const [childrenCount, adsCount] = await Promise.all([
      this.prismaService.adCategory.count({
        where: {
          parentId: id,
        },
      }),
      this.prismaService.ad.count({
        where: {
          categoryId: id,
        },
      }),
    ]);

    const blockers: string[] = [];

    if (childrenCount > 0) {
      blockers.push('есть дочерние категории');
    }

    if (adsCount > 0) {
      blockers.push('есть связанные объявления');
    }

    if (blockers.length) {
      throw new BadRequestException(
        `Категорию объявлений нельзя удалить навсегда: ${blockers.join(', ')}.`,
      );
    }
  }

  private getAdStatus(value: unknown): AdStatus {
    if (
      typeof value === 'string' &&
      Object.values(AdStatus).includes(value as AdStatus)
    ) {
      return value as AdStatus;
    }

    return AdStatus.PUBLISHED;
  }

  private mapAdCategory(adCategory: any, adCategoryById: Map<string, any>) {
    return {
      id: adCategory.id,
      name: adCategory.name,
      slug: adCategory.slug,
      path: this.getCategoryPath(adCategory, adCategoryById),
      sortOrder: adCategory.sortOrder,
      description: adCategory.description ?? undefined,
      parentId: adCategory.parentId ?? undefined,
      image: adCategory.image ?? undefined,
      isActive: adCategory.isActive,
      deletedAt: adCategory.deletedAt,
      adsCount: adCategory._count?.ads ?? 0,
    };
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

  private mapAdminUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      nicknameSuffix: user.nicknameSuffix,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      patronymic: user.patronymic ?? undefined,
      role: user.role,
      phone: user.phone ?? undefined,
      referralCode: user.referralCode ?? undefined,
      avatar: user.avatar ?? undefined,
      isActive: user.deletedAt === null,
      deletedAt: user.deletedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      adsCount: user._count?.ads ?? 0,
      ordersCount: user._count?.orders ?? 0,
    };
  }

  // ===== Bulk operations =====

  private getIdsFromBody(body: unknown): string[] {
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

  async hardDeleteUser(id: string) {
    await this.prismaService.$transaction(async (tx) => {
      const adIds = (await tx.ad.findMany({ where: { sellerId: id }, select: { id: true } })).map((a) => a.id);
      const referralIds = (await tx.referral.findMany({ where: { OR: [{ inviterUserId: id }, { invitedUserId: id }] }, select: { id: true } })).map((r) => r.id);

      await tx.referralReward.deleteMany({ where: { referralId: { in: referralIds } } });
      await tx.referral.deleteMany({ where: { id: { in: referralIds } } });
      await tx.cartItem.deleteMany({ where: { OR: [{ userId: id }, { adId: { in: adIds } }] } });
      await tx.favourite.deleteMany({ where: { OR: [{ userId: id }, { adId: { in: adIds } }] } });
      await tx.adImage.deleteMany({ where: { adId: { in: adIds } } });
      await tx.ad.deleteMany({ where: { sellerId: id } });
      await tx.cartItem.deleteMany({ where: { userId: id } });
      await tx.balance.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });
    return { deleted: 1 };
  }

  async bulkDeleteUsers(body: unknown) {
    const ids = this.getIdsFromBody(body);
    await Promise.all(ids.map((id) => this.usersService.softDeleteById(id)));
    return { deleted: ids.length };
  }

  async bulkHardDeleteUsers(body: unknown) {
    const ids = this.getIdsFromBody(body);
    await this.prismaService.$transaction(async (tx) => {
      const adIds = (await tx.ad.findMany({ where: { sellerId: { in: ids } }, select: { id: true } })).map((a) => a.id);
      const referralIds = (await tx.referral.findMany({ where: { OR: [{ inviterUserId: { in: ids } }, { invitedUserId: { in: ids } }] }, select: { id: true } })).map((r) => r.id);

      await tx.referralReward.deleteMany({ where: { referralId: { in: referralIds } } });
      await tx.referral.deleteMany({ where: { id: { in: referralIds } } });
      await tx.cartItem.deleteMany({ where: { OR: [{ userId: { in: ids } }, { adId: { in: adIds } }] } });
      await tx.favourite.deleteMany({ where: { OR: [{ userId: { in: ids } }, { adId: { in: adIds } }] } });
      await tx.adImage.deleteMany({ where: { adId: { in: adIds } } });
      await tx.ad.deleteMany({ where: { sellerId: { in: ids } } });
      await tx.balance.deleteMany({ where: { userId: { in: ids } } });
      await tx.user.deleteMany({ where: { id: { in: ids } } });
    });
    return { deleted: ids.length };
  }

  async bulkDeleteProducts(body: unknown) {
    const ids = this.getIdsFromBody(body);
    await this.prismaService.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false, deletedAt: new Date() },
    });
    return { deleted: ids.length };
  }

  async bulkHardDeleteProducts(body: unknown) {
    const ids = this.getIdsFromBody(body);
    await this.prismaService.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: { in: ids } } });
      await tx.product.deleteMany({ where: { id: { in: ids } } });
    });
    return { deleted: ids.length };
  }

  async bulkDeleteMarketCategories(body: unknown) {
    const ids = this.getIdsFromBody(body);
    await this.prismaService.marketCategory.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false, deletedAt: new Date() },
    });
    return { deleted: ids.length };
  }

  async bulkHardDeleteMarketCategories(body: unknown) {
    const ids = this.getIdsFromBody(body);
    await this.prismaService.marketCategory.deleteMany({ where: { id: { in: ids } } });
    return { deleted: ids.length };
  }

  async bulkDeleteAdCategories(body: unknown) {
    const ids = this.getIdsFromBody(body);
    await this.prismaService.adCategory.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false, deletedAt: new Date() },
    });
    return { deleted: ids.length };
  }

  async bulkHardDeleteAdCategories(body: unknown) {
    const ids = this.getIdsFromBody(body);
    await this.prismaService.adCategory.deleteMany({ where: { id: { in: ids } } });
    return { deleted: ids.length };
  }

  async bulkDeleteAds(body: unknown) {
    const ids = this.getIdsFromBody(body);
    await this.prismaService.ad.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false, status: AdStatus.ARCHIVED, deletedAt: new Date() },
    });
    return { deleted: ids.length };
  }

  async bulkHardDeleteAds(body: unknown) {
    const ids = this.getIdsFromBody(body);
    await this.prismaService.$transaction(async (tx) => {
      await tx.adImage.deleteMany({ where: { adId: { in: ids } } });
      await tx.ad.deleteMany({ where: { id: { in: ids } } });
    });
    return { deleted: ids.length };
  }

  async bulkRestoreProducts(body: unknown) {
    const ids = this.getIdsFromBody(body);
    await this.prismaService.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive: true, deletedAt: null },
    });
    return { restored: ids.length };
  }

  async bulkRestoreMarketCategories(body: unknown) {
    const ids = this.getIdsFromBody(body);
    await this.prismaService.marketCategory.updateMany({
      where: { id: { in: ids } },
      data: { isActive: true, deletedAt: null },
    });
    return { restored: ids.length };
  }

  async bulkRestoreAdCategories(body: unknown) {
    const ids = this.getIdsFromBody(body);
    await this.prismaService.adCategory.updateMany({
      where: { id: { in: ids } },
      data: { isActive: true, deletedAt: null },
    });
    return { restored: ids.length };
  }

  async bulkRestoreAds(body: unknown) {
    const ids = this.getIdsFromBody(body);
    await this.prismaService.ad.updateMany({
      where: { id: { in: ids } },
      data: { isActive: true, status: AdStatus.PUBLISHED, deletedAt: null },
    });
    return { restored: ids.length };
  }

}
