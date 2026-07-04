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
const ACTIVE_CATEGORY_WHERE = {
    isActive: true,
    deletedAt: null,
};
const ACTIVE_PRODUCT_WHERE = {
    isActive: true,
    deletedAt: null,
};
const SORT_FIELD_WHITELIST = new Set([
    'title',
    'category',
    'createdAt',
    'price',
]);
const SORT_DIRECTION_WHITELIST = new Set([
    'asc',
    'desc',
]);
let ProductsService = class ProductsService {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async findAll(params = {}) {
        const activeCategories = await this.getActiveCategories();
        const categoryById = new Map(activeCategories.map((category) => [category.id, category]));
        const categoryIds = await this.getFilteredCategoryIds({
            categorySlug: params.categorySlug,
            categoryIds: params.categoryIds,
            activeCategories,
        });
        const where = {
            ...ACTIVE_PRODUCT_WHERE,
            category: ACTIVE_CATEGORY_WHERE,
        };
        if (categoryIds?.length) {
            where.categoryId = {
                in: categoryIds,
            };
        }
        if (typeof params.priceFrom === 'number' ||
            typeof params.priceTo === 'number') {
            where.price = {
                gte: params.priceFrom,
                lte: params.priceTo,
            };
        }
        const products = await this.prismaService.product.findMany({
            where,
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
            orderBy: this.getOrderBy(params.sort),
        });
        return products.map((product) => this.mapProduct(product, categoryById));
    }
    async findById(productId) {
        const activeCategories = await this.getActiveCategories();
        const categoryById = new Map(activeCategories.map((category) => [category.id, category]));
        const product = await this.prismaService.product.findFirst({
            where: {
                id: productId,
                ...ACTIVE_PRODUCT_WHERE,
                category: ACTIVE_CATEGORY_WHERE,
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
        return this.mapProduct(product, categoryById);
    }
    getActiveCategories() {
        return this.prismaService.marketCategory.findMany({
            where: ACTIVE_CATEGORY_WHERE,
            include: {
                image: true,
            },
            orderBy: {
                sortOrder: 'asc',
            },
        });
    }
    async getFilteredCategoryIds(params) {
        const requestedCategoryIds = params.categoryIds?.filter(Boolean) ?? [];
        if (!params.categorySlug && !requestedCategoryIds.length) {
            return undefined;
        }
        const categoryIdsFromSlug = params.categorySlug
            ? this.getCategoryAndDescendantIds({
                categorySlug: params.categorySlug,
                categories: params.activeCategories,
            })
            : undefined;
        if (categoryIdsFromSlug && !categoryIdsFromSlug.length) {
            return [];
        }
        if (!requestedCategoryIds.length) {
            return categoryIdsFromSlug;
        }
        if (!categoryIdsFromSlug) {
            return requestedCategoryIds;
        }
        const categoryIdsFromSlugSet = new Set(categoryIdsFromSlug);
        return requestedCategoryIds.filter((categoryId) => categoryIdsFromSlugSet.has(categoryId));
    }
    getCategoryAndDescendantIds(params) {
        const rootCategory = params.categories.find((category) => category.slug === params.categorySlug);
        if (!rootCategory) {
            return [];
        }
        const childrenByParentId = new Map();
        params.categories.forEach((category) => {
            if (!category.parentId) {
                return;
            }
            const children = childrenByParentId.get(category.parentId) ?? [];
            childrenByParentId.set(category.parentId, [...children, category]);
        });
        const result = [];
        const stack = [rootCategory];
        while (stack.length) {
            const category = stack.pop();
            if (!category) {
                continue;
            }
            result.push(category.id);
            stack.push(...(childrenByParentId.get(category.id) ?? []));
        }
        return result;
    }
    getOrderBy(sort) {
        const sortRules = sort
            ?.split(',')
            .map((rawRule) => {
            const [field, direction] = rawRule.split(':');
            if (!SORT_FIELD_WHITELIST.has(field) ||
                !SORT_DIRECTION_WHITELIST.has(direction)) {
                return undefined;
            }
            return {
                field: field,
                direction: direction,
            };
        })
            .filter(Boolean);
        if (!sortRules?.length) {
            return [
                {
                    createdAt: 'desc',
                },
            ];
        }
        return sortRules.map((rule) => {
            if (rule.field === 'category') {
                return {
                    category: {
                        name: rule.direction,
                    },
                };
            }
            return {
                [rule.field]: rule.direction,
            };
        });
    }
    getCategoryPath(category, categoryById) {
        const parts = [];
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
    mapCategory(category, categoryById) {
        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            path: this.getCategoryPath(category, categoryById),
            sortOrder: category.sortOrder,
            description: category.description ?? undefined,
            parentId: category.parentId ?? undefined,
            image: category.image ?? undefined,
        };
    }
    mapProduct(product, categoryById) {
        return {
            id: product.id,
            categoryId: product.categoryId,
            category: this.mapCategory(product.category, categoryById),
            title: product.title,
            slug: product.slug,
            description: product.description,
            price: product.price,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
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