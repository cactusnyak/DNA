import { PrismaService } from '../prisma/prisma.service';
type FindAllProductsParams = {
    categorySlug?: string;
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
            sortOrder: any;
            description: any;
            parentId: any;
            image: any;
        };
        title: any;
        slug: any;
        description: any;
        price: any;
        images: any;
    }[]>;
    findById(productId: string): Promise<{
        id: any;
        categoryId: any;
        category: {
            id: any;
            name: any;
            slug: any;
            sortOrder: any;
            description: any;
            parentId: any;
            image: any;
        };
        title: any;
        slug: any;
        description: any;
        price: any;
        images: any;
    }>;
    private mapProduct;
}
export {};
