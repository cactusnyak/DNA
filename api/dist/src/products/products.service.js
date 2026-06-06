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
        const products = await this.prismaService.product.findMany({
            where: {
                category: params.categorySlug
                    ? {
                        slug: params.categorySlug,
                    }
                    : undefined,
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
            orderBy: {
                title: 'asc',
            },
        });
        return products.map((product) => this.mapProduct(product));
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
        return this.mapProduct(product);
    }
    mapProduct(product) {
        return {
            id: product.id,
            categoryId: product.categoryId,
            category: {
                id: product.category.id,
                name: product.category.name,
                slug: product.category.slug,
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