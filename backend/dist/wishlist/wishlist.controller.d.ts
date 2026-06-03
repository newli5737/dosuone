import { WishlistService } from './wishlist.service';
import { User } from '../entities';
export declare class WishlistController {
    private service;
    constructor(service: WishlistService);
    findAll(user: User): Promise<import("../entities").Product[]>;
    add(user: User, productId: string): Promise<import("../entities").Product[]>;
    remove(user: User, productId: string): Promise<import("../entities").Product[]>;
}
