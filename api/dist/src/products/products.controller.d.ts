import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(categoryId?: string): Promise<{
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
}
