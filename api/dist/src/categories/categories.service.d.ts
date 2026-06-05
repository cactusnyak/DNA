import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        slug: string;
        sortOrder: number;
        description: string | undefined;
        parentId: string | undefined;
        image: {
            id: string;
            sortOrder: number;
            url: string;
            alt: string | null;
        } | undefined;
    }[]>;
}
