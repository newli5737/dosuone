import { Repository } from 'typeorm';
import { Order, Product, User } from '../entities';
export declare class AdminService {
    private ordersRepo;
    private productsRepo;
    private usersRepo;
    constructor(ordersRepo: Repository<Order>, productsRepo: Repository<Product>, usersRepo: Repository<User>);
    overview(): Promise<{
        month_revenue: number;
        today_orders: number;
        active_products: number;
        new_users_week: number;
    }>;
    revenue(period?: string): Promise<{
        date: any;
        revenue: number;
    }[]>;
    topProducts(): Promise<any[]>;
    listUsers(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            email: string;
            fullName: string;
            phone: string;
            avatarUrl: string;
            role: import("../entities").UserRole;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: import("../common/utils/pagination.util").PaginationMeta;
    }>;
    updateUserStatus(id: string, isActive: boolean): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        avatarUrl: string;
        role: import("../entities").UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
