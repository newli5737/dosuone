import { NotificationsService } from './notifications.service';
import { User } from '../entities';
export declare class NotificationsController {
    private service;
    constructor(service: NotificationsService);
    findAll(user: User, page?: number, limit?: number): Promise<{
        data: import("../entities").Notification[];
        meta: import("../common/utils/pagination.util").PaginationMeta;
    }>;
    unreadCount(user: User): Promise<{
        count: number;
    }>;
    markAllRead(user: User): Promise<{
        message: string;
    }>;
    markRead(user: User, id: string): Promise<import("../entities").Notification>;
}
