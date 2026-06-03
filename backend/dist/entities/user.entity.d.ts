import { UserRole } from './enums';
export declare class User {
    id: string;
    email: string;
    password: string;
    fullName: string;
    phone: string;
    avatarUrl: string;
    role: UserRole;
    isActive: boolean;
    refreshToken: string | null;
    createdAt: Date;
    updatedAt: Date;
}
