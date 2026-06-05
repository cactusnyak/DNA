import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
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
