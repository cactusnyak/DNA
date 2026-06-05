import { PrismaService } from '../prisma/prisma.service';
type FindAllProductsParams = {
    categoryId?: string;
};
export declare class ProductsService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    findAll(params?: FindAllProductsParams): Promise<{
        id: any;
        categoryId: any;
        title: any;
        slug: any;
        description: any;
        price: any;
        images: any;
    }[]>;
    findById(productId: string): Promise<{
        id: any;
        categoryId: any;
        title: any;
        slug: any;
        description: any;
        price: any;
        images: any;
    }>;
    private mapProduct;
}
export {};
