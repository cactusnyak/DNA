import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    findAll(): Promise<{
        id: string;
        categoryId: string;
        title: string;
        slug: string;
        description: string;
        price: number;
        images: {
            id: string;
            url: string;
            sortOrder: number;
            alt: string | null;
        }[];
    }[]>;
}
