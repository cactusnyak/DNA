import { PrismaService } from '../prisma/prisma.service';
type FindAllProductsParams = {
    categorySlug?: string;
    priceFrom?: number;
    priceTo?: number;
    categoryIds?: string[];
    sort?: string;
};
export declare class ProductsService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    findAll(params?: FindAllProductsParams): Promise<{
        id: any;
        categoryId: any;
        category: {
            id: any;
            name: any;
            slug: any;
            path: string;
            sortOrder: any;
            description: any;
            parentId: any;
            image: any;
        };
        title: any;
        slug: any;
        description: any;
        price: any;
        createdAt: any;
        updatedAt: any;
        images: any;
    }[]>;
    findById(productId: string): Promise<{
        id: any;
        categoryId: any;
        category: {
            id: any;
            name: any;
            slug: any;
            path: string;
            sortOrder: any;
            description: any;
            parentId: any;
            image: any;
        };
        title: any;
        slug: any;
        description: any;
        price: any;
        createdAt: any;
        updatedAt: any;
        images: any;
    }>;
    private getActiveCategories;
    private getFilteredCategoryIds;
    private getCategoryAndDescendantIds;
    private getOrderBy;
    private getCategoryPath;
    private mapCategory;
    private mapProduct;
}
export {};
