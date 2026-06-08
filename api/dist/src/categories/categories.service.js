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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async findAll() {
        const categories = await this.prismaService.category.findMany({
            include: {
                image: true,
            },
            orderBy: {
                sortOrder: 'asc',
            },
        });
        const categoryById = new Map(categories.map((category) => [category.id, category]));
        function getCategoryPath(category) {
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
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map