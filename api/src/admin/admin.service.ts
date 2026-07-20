import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { AdminAdsService } from './admin-ads.service';
import { AdminMarketCatalogService } from './admin-market-catalog.service';
import { AdminOrdersService } from './admin-orders.service';
import { AdminUsersService } from './admin-users.service';


@Injectable()
export class AdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly adminAdsService: AdminAdsService,
    private readonly adminMarketCatalogService: AdminMarketCatalogService,
    private readonly adminOrdersService: AdminOrdersService,
    private readonly adminUsersService: AdminUsersService,
  ) {}

  updateOrderStatus(id: string, body: unknown) {
    return this.adminOrdersService.updateOrderStatus(id, body);
  }

  hardDeleteOrder(id: string) {
    return this.adminOrdersService.hardDeleteOrder(id);
  }

  updateUserRole(id: string, body: unknown) {
    return this.adminUsersService.updateUserRole(id, body);
  }

  deleteUser(id: string) {
    return this.adminUsersService.deleteUser(id);
  }

  hardDeleteUser(id: string) {
    return this.adminUsersService.hardDeleteUser(id);
  }

  bulkDeleteUsers(body: unknown) {
    return this.adminUsersService.bulkDeleteUsers(body);
  }

  bulkHardDeleteUsers(body: unknown) {
    return this.adminUsersService.bulkHardDeleteUsers(body);
  }

  createCategory(body: unknown) {
    return this.adminMarketCatalogService.createCategory(body);
  }

  updateCategory(id: string, body: unknown) {
    return this.adminMarketCatalogService.updateCategory(id, body);
  }

  deleteCategory(id: string) {
    return this.adminMarketCatalogService.deleteCategory(id);
  }

  restoreCategory(id: string) {
    return this.adminMarketCatalogService.restoreCategory(id);
  }

  hardDeleteCategory(id: string) {
    return this.adminMarketCatalogService.hardDeleteCategory(id);
  }

  bulkDeleteMarketCategories(body: unknown) {
    return this.adminMarketCatalogService.bulkDeleteMarketCategories(body);
  }

  bulkHardDeleteMarketCategories(body: unknown) {
    return this.adminMarketCatalogService.bulkHardDeleteMarketCategories(body);
  }

  bulkRestoreMarketCategories(body: unknown) {
    return this.adminMarketCatalogService.bulkRestoreMarketCategories(body);
  }

  createProduct(body: unknown) {
    return this.adminMarketCatalogService.createProduct(body);
  }

  updateProduct(id: string, body: unknown) {
    return this.adminMarketCatalogService.updateProduct(id, body);
  }

  deleteProduct(id: string) {
    return this.adminMarketCatalogService.deleteProduct(id);
  }

  restoreProduct(id: string) {
    return this.adminMarketCatalogService.restoreProduct(id);
  }

  hardDeleteProduct(id: string) {
    return this.adminMarketCatalogService.hardDeleteProduct(id);
  }

  bulkDeleteProducts(body: unknown) {
    return this.adminMarketCatalogService.bulkDeleteProducts(body);
  }

  bulkHardDeleteProducts(body: unknown) {
    return this.adminMarketCatalogService.bulkHardDeleteProducts(body);
  }

  bulkRestoreProducts(body: unknown) {
    return this.adminMarketCatalogService.bulkRestoreProducts(body);
  }

  createAdCategory(body: unknown) {
    return this.adminAdsService.createAdCategory(body);
  }

  updateAdCategory(id: string, body: unknown) {
    return this.adminAdsService.updateAdCategory(id, body);
  }

  deleteAdCategory(id: string) {
    return this.adminAdsService.deleteAdCategory(id);
  }

  restoreAdCategory(id: string) {
    return this.adminAdsService.restoreAdCategory(id);
  }

  hardDeleteAdCategory(id: string) {
    return this.adminAdsService.hardDeleteAdCategory(id);
  }

  bulkDeleteAdCategories(body: unknown) {
    return this.adminAdsService.bulkDeleteAdCategories(body);
  }

  bulkHardDeleteAdCategories(body: unknown) {
    return this.adminAdsService.bulkHardDeleteAdCategories(body);
  }

  bulkRestoreAdCategories(body: unknown) {
    return this.adminAdsService.bulkRestoreAdCategories(body);
  }

  bulkDeleteAds(body: unknown) {
    return this.adminAdsService.bulkDeleteAds(body);
  }

  bulkHardDeleteAds(body: unknown) {
    return this.adminAdsService.bulkHardDeleteAds(body);
  }

  bulkRestoreAds(body: unknown) {
    return this.adminAdsService.bulkRestoreAds(body);
  }

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
      id: string; nickname: string; nicknameSuffix?: string; email: string | null;
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
            : (user.nickname.trim() || user.email || user.phone), next);
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

  createCatalogCollection(body: unknown) {
    return this.adminMarketCatalogService.createCatalogCollection(body);
  }

  updateCatalogCollection(id: string, body: unknown) {
    return this.adminMarketCatalogService.updateCatalogCollection(id, body);
  }

  deleteCatalogCollection(id: string) {
    return this.adminMarketCatalogService.deleteCatalogCollection(id);
  }

  restoreCatalogCollection(id: string) {
    return this.adminMarketCatalogService.restoreCatalogCollection(id);
  }

  hardDeleteCatalogCollection(id: string) {
    return this.adminMarketCatalogService.hardDeleteCatalogCollection(id);
  }

  updateCatalogCollectionCategories(id: string, body: unknown) {
    return this.adminMarketCatalogService.updateCatalogCollectionCategories(id, body);
  }

  updateCatalogCollectionProducts(id: string, body: unknown) {
    return this.adminMarketCatalogService.updateCatalogCollectionProducts(id, body);
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




  // ===== Ads (moderation & management) =====

  updateAd(id: string, body: unknown) {
    return this.adminAdsService.updateAd(id, body);
  }

  deleteAd(id: string) {
    return this.adminAdsService.deleteAd(id);
  }

  restoreAd(id: string) {
    return this.adminAdsService.restoreAd(id);
  }

  hardDeleteAd(id: string) {
    return this.adminAdsService.hardDeleteAd(id);
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
