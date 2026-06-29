import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(categorySlug?: string, priceFrom?: string, priceTo?: string, categoryIds?: string, sort?: string): Promise<{
        id: any;
        categoryId: any;
        category: {
            id: any;
            name: any;
            slug: any;
            path: string;
            sortOrder: any;
            description: any;
            parentId: any;
            image: any;
        };
        title: any;
        slug: any;
        description: any;
        price: any;
        createdAt: any;
        updatedAt: any;
        images: any;
    }[]>;
    findById(productId: string): Promise<{
        id: any;
        categoryId: any;
        category: {
            id: any;
            name: any;
            slug: any;
            path: string;
            sortOrder: any;
            description: any;
            parentId: any;
            image: any;
        };
        title: any;
        slug: any;
        description: any;
        price: any;
        createdAt: any;
        updatedAt: any;
        images: any;
    }>;
}
