import { User } from './user.entity';
import { NotificationType } from './enums';
export declare class Notification {
    id: string;
    userId: string;
    user: User;
    title: string;
    body: string;
    type: NotificationType;
    isRead: boolean;
    data: Record<string, unknown>;
    createdAt: Date;
}
