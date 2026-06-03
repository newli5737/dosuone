import { Order } from './order.entity';
import { Product } from './product.entity';
import { Review } from './review.entity';
export declare class OrderItem {
    id: string;
    orderId: string;
    order: Order;
    productId: string;
    product: Product;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    total: number;
    review: Review;
}
