import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<{
        id: string;
        name: string;
        slug: string;
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
