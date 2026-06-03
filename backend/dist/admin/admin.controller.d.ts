import { AdminService } from './admin.service';
import { UserRole } from '../entities';
declare class UserStatusDto {
    is_active: boolean;
}
export declare class AdminController {
    private service;
    constructor(service: AdminService);
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
            role: UserRole;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: import("../common/utils/pagination.util").PaginationMeta;
    }>;
    updateUserStatus(id: string, dto: UserStatusDto): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        avatarUrl: string;
        role: UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
