import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        category: {
            id: string;
            slug: string;
            description: string | null;
            name: string;
            sortOrder: number;
            parentId: string | null;
            imageId: string | null;
        };
        images: ({
            image: {
                url: string;
                id: string;
                sortOrder: number;
                alt: string | null;
            };
        } & {
            imageId: string;
            productId: string;
        })[];
    } & {
        id: string;
        categoryId: string;
        title: string;
        slug: string;
        description: string;
        price: number;
    })[]>;
}
