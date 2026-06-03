import { Repository } from 'typeorm';
import { Notification } from '../entities';
export declare class NotificationsService {
    private repo;
    constructor(repo: Repository<Notification>);
    findAll(userId: string, page?: number, limit?: number): Promise<{
        data: Notification[];
        meta: import("../common/utils/pagination.util").PaginationMeta;
    }>;
    markRead(userId: string, id: string): Promise<Notification>;
    markAllRead(userId: string): Promise<{
        message: string;
    }>;
    unreadCount(userId: string): Promise<{
        count: number;
    }>;
}
