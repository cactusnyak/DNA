import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        slug: string;
        path: string;
        sortOrder: number;
        description: string | undefined;
        parentId: string | undefined;
        image: {
            url: string;
            id: string;
            sortOrder: number;
            alt: string | null;
        } | undefined;
    }[]>;
}
