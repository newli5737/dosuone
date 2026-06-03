import { ProductsService } from './products.service';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto/product.dto';
export declare class ProductsController {
    private service;
    constructor(service: ProductsService);
    findAll(query: ProductQueryDto): Promise<{
        data: import("../entities").Product[];
        meta: import("../common/utils/pagination.util").PaginationMeta;
    }>;
    findFeatured(): Promise<import("../entities").Product[]>;
    findBySlug(slug: string): Promise<import("../entities").Product>;
    getReviews(id: string, page?: number, limit?: number): Promise<{
        data: {
            user: {
                id: string;
                full_name: string;
                avatar_url: string;
            };
            id: string;
            productId: string;
            product: import("../entities").Product;
            userId: string;
            orderItemId: string;
            orderItem: import("../entities").OrderItem;
            rating: number;
            comment: string;
            createdAt: Date;
        }[];
        meta: import("../common/utils/pagination.util").PaginationMeta;
    }>;
    create(dto: CreateProductDto): Promise<import("../entities").Product>;
    update(id: string, dto: UpdateProductDto): Promise<import("../entities").Product>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
