import { ReviewsService } from './reviews.service';
import { User } from '../entities';
declare class CreateReviewDto {
    order_item_id: string;
    rating: number;
    comment?: string;
}
declare class UpdateReviewDto {
    rating?: number;
    comment?: string;
}
export declare class ReviewsController {
    private service;
    constructor(service: ReviewsService);
    create(user: User, dto: CreateReviewDto): Promise<import("../entities").Review>;
    update(user: User, id: string, dto: UpdateReviewDto): Promise<import("../entities").Review>;
    remove(user: User, id: string): Promise<{
        message: string;
    }>;
}
export {};
