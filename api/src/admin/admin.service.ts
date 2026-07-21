import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}

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
        where: {
          archivedAt: null,
        },
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

  private mapCatalogCollection(
    collection: any,
    categoryById: Map<string, any>,
  ) {
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
      archivedAt: order.archivedAt ?? undefined,
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
}
