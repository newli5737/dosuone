import { Repository } from 'typeorm';
import { Product, Wishlist } from '../entities';
export declare class WishlistService {
    private wishlistRepo;
    private productsRepo;
    constructor(wishlistRepo: Repository<Wishlist>, productsRepo: Repository<Product>);
    findAll(userId: string): Promise<Product[]>;
    add(userId: string, productId: string): Promise<Product[]>;
    remove(userId: string, productId: string): Promise<Product[]>;
}
