"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async findAll(params = {}) {
        const categoryIds = params.categorySlug
            ? await this.getCategoryWithDescendantIds(params.categorySlug)
            : undefined;
        const products = await this.prismaService.product.findMany({
            where: categoryIds
                ? {
                    categoryId: {
                        in: categoryIds,
                    },
                }
                : undefined,
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
                title: 'asc',
            },
        });
        const categoryPathById = await this.getCategoryPathById();
        return products.map((product) => this.mapProduct(product, categoryPathById));
    }
    async findById(productId) {
        const product = await this.prismaService.product.findUnique({
            where: {
                id: productId,
            },
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
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const categoryPathById = await this.getCategoryPathById();
        return this.mapProduct(product, categoryPathById);
    }
    async getCategoryWithDescendantIds(categorySlug) {
        const rootCategory = await this.prismaService.category.findUnique({
            where: {
                slug: categorySlug,
            },
            select: {
                id: true,
            },
        });
        if (!rootCategory) {
            return [];
        }
        const categories = await this.prismaService.category.findMany({
            select: {
                id: true,
                parentId: true,
            },
        });
        return this.collectDescendantCategoryIds(categories, rootCategory.id);
    }
    collectDescendantCategoryIds(categories, rootCategoryId) {
        const categoryIds = new Set([rootCategoryId]);
        let shouldContinue = true;
        while (shouldContinue) {
            shouldContinue = false;
            categories.forEach((category) => {
                if (category.parentId &&
                    categoryIds.has(category.parentId) &&
                    !categoryIds.has(category.id)) {
                    categoryIds.add(category.id);
                    shouldContinue = true;
                }
            });
        }
        return Array.from(categoryIds);
    }
    async getCategoryPathById() {
        const categories = await this.prismaService.category.findMany({
            select: {
                id: true,
                slug: true,
                parentId: true,
            },
        });
        const categoryById = new Map(categories.map((category) => [category.id, category]));
        const categoryPathById = new Map();
        categories.forEach((category) => {
            const parts = [];
            let currentCategory = category;
            while (currentCategory) {
                parts.unshift(currentCategory.slug);
                if (!currentCategory.parentId) {
                    break;
                }
                currentCategory = categoryById.get(currentCategory.parentId);
            }
            categoryPathById.set(category.id, parts.join('/'));
        });
        return categoryPathById;
    }
    mapProduct(product, categoryPathById) {
        return {
            id: product.id,
            categoryId: product.categoryId,
            category: {
                id: product.category.id,
                name: product.category.name,
                slug: product.category.slug,
                path: categoryPathById.get(product.category.id) ?? product.category.slug,
                sortOrder: product.category.sortOrder,
                description: product.category.description ?? undefined,
                parentId: product.category.parentId ?? undefined,
                image: product.category.image ?? undefined,
            },
            title: product.title,
            slug: product.slug,
            description: product.description,
            price: product.price,
            images: product.images
                .map((productImage) => productImage.image)
                .sort((firstImage, secondImage) => firstImage.sortOrder - secondImage.sortOrder),
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map