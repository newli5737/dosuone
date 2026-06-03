import { User } from './user.entity';
export declare class Address {
    id: string;
    userId: string;
    user: User;
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    addressDetail: string;
    isDefault: boolean;
}
