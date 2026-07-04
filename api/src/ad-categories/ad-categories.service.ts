import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

const ACTIVE_AD_CATEGORY_WHERE = {
  isActive: true,
  deletedAt: null,
};

@Injectable()
export class AdCategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    const categories = await this.prismaService.adCategory.findMany({
      where: ACTIVE_AD_CATEGORY_WHERE,
      include: {
        image: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const categoryById = new Map(
      categories.map((category) => [category.id, category]),
    );

    function getCategoryPath(category: (typeof categories)[number]) {
      const parts: string[] = [];

      let currentCategory: (typeof categories)[number] | undefined = category;

      while (currentCategory) {
        parts.unshift(currentCategory.slug);

        if (!currentCategory.parentId) {
          break;
        }

        currentCategory = categoryById.get(currentCategory.parentId);
      }

      return parts.join('/');
    }

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      path: getCategoryPath(category),
      sortOrder: category.sortOrder,
      description: category.description ?? undefined,
      parentId: category.parentId ?? undefined,
      image: category.image ?? undefined,
    }));
  }
}
