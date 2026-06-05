import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        category: {
            id: string;
            name: string;
            slug: string;
            sortOrder: number;
            description: string | null;
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
        slug: string;
        description: string;
        title: string;
        price: number;
        categoryId: string;
    })[]>;
}
