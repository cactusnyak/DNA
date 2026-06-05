import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    const categories = await this.prismaService.category.findMany({
      include: {
        image: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      sortOrder: category.sortOrder,
      description: category.description ?? undefined,
      parentId: category.parentId ?? undefined,
      image: category.image ?? undefined,
    }));
  }
}