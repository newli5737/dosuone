import { Repository } from 'typeorm';
import { OrderItem, Product, Review } from '../entities';
export declare class ReviewsService {
    private reviewsRepo;
    private orderItemsRepo;
    private productsRepo;
    constructor(reviewsRepo: Repository<Review>, orderItemsRepo: Repository<OrderItem>, productsRepo: Repository<Product>);
    private updateProductRating;
    create(userId: string, orderItemId: string, rating: number, comment?: string): Promise<Review>;
    update(userId: string, id: string, rating?: number, comment?: string): Promise<Review>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
