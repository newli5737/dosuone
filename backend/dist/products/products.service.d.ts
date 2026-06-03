import { Repository } from 'typeorm';
import { Product, ProductImage, ProductSpec, Review } from '../entities';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto/product.dto';
export declare class ProductsService {
    private productsRepo;
    private imagesRepo;
    private specsRepo;
    private reviewsRepo;
    constructor(productsRepo: Repository<Product>, imagesRepo: Repository<ProductImage>, specsRepo: Repository<ProductSpec>, reviewsRepo: Repository<Review>);
    findAll(query: ProductQueryDto): Promise<{
        data: Product[];
        meta: import("../common/utils/pagination.util").PaginationMeta;
    }>;
    findFeatured(): Promise<Product[]>;
    findBySlug(slug: string): Promise<Product>;
    getReviews(productId: string, page?: number, limit?: number): Promise<{
        data: {
            user: {
                id: string;
                full_name: string;
                avatar_url: string;
            };
            id: string;
            productId: string;
            product: Product;
            userId: string;
            orderItemId: string;
            orderItem: import("../entities").OrderItem;
            rating: number;
            comment: string;
            createdAt: Date;
        }[];
        meta: import("../common/utils/pagination.util").PaginationMeta;
    }>;
    create(dto: CreateProductDto): Promise<Product>;
    update(id: string, dto: UpdateProductDto): Promise<Product>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
