import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(categoryId?: string): Promise<{
        id: any;
        categoryId: any;
        title: any;
        slug: any;
        description: any;
        price: any;
        images: any;
    }[]>;
    findById(productId: string): Promise<{
        id: any;
        categoryId: any;
        title: any;
        slug: any;
        description: any;
        price: any;
        images: any;
    }>;
}
