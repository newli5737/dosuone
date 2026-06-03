import { Product } from './product.entity';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
export declare class Review {
    id: string;
    productId: string;
    product: Product;
    userId: string;
    user: User;
    orderItemId: string;
    orderItem: OrderItem;
    rating: number;
    comment: string;
    createdAt: Date;
}
