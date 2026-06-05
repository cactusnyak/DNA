import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
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
