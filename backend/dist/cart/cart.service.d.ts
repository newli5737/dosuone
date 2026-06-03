import { Repository } from 'typeorm';
import { CartItem, Product } from '../entities';
export declare class CartService {
    private cartRepo;
    private productsRepo;
    constructor(cartRepo: Repository<CartItem>, productsRepo: Repository<Product>);
    private mapItem;
    getCart(userId: string): Promise<{
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
    addItem(userId: string, productId: string, quantity: number): Promise<{
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
    updateQuantity(userId: string, productId: string, quantity: number): Promise<{
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
    removeItem(userId: string, productId: string): Promise<{
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
    clear(userId: string): Promise<{
        message: string;
    }>;
}
