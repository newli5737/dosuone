import { CartService } from './cart.service';
import { User } from '../entities';
declare class AddCartDto {
    product_id: string;
    quantity: number;
}
declare class UpdateCartDto {
    quantity: number;
}
export declare class CartController {
    private service;
    constructor(service: CartService);
    getCart(user: User): Promise<{
        items: {
            id: string;
            product_id: string;
            quantity: number;
            product: {
                id: string;
                name: string;
                slug: string;
                thumbnail_url: string;
                price: number;
                sale_price: number;
                effective_price: number;
                stock: number;
            };
            line_total: number;
        }[];
        subtotal: number;
        item_count: number;
    }>;
    addItem(user: User, dto: AddCartDto): Promise<{
        items: {
            id: string;
            product_id: string;
            quantity: number;
            product: {
                id: string;
                name: string;
                slug: string;
                thumbnail_url: string;
                price: number;
                sale_price: number;
                effective_price: number;
                stock: number;
            };
            line_total: number;
        }[];
        subtotal: number;
        item_count: number;
    }>;
    updateItem(user: User, productId: string, dto: UpdateCartDto): Promise<{
        items: {
            id: string;
            product_id: string;
            quantity: number;
            product: {
                id: string;
                name: string;
                slug: string;
                thumbnail_url: string;
                price: number;
                sale_price: number;
                effective_price: number;
                stock: number;
            };
            line_total: number;
        }[];
        subtotal: number;
        item_count: number;
    }>;
    removeItem(user: User, productId: string): Promise<{
        items: {
            id: string;
            product_id: string;
            quantity: number;
            product: {
                id: string;
                name: string;
                slug: string;
                thumbnail_url: string;
                price: number;
                sale_price: number;
                effective_price: number;
                stock: number;
            };
            line_total: number;
        }[];
        subtotal: number;
        item_count: number;
    }>;
    clear(user: User): Promise<{
        message: string;
    }>;
}
export {};
