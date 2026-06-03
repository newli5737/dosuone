import { AddressesService } from './addresses.service';
import { User } from '../entities';
declare class AddressDto {
    full_name: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    address_detail: string;
    is_default?: boolean;
}
export declare class AddressesController {
    private service;
    constructor(service: AddressesService);
    findAll(user: User): Promise<import("../entities").Address[]>;
    create(user: User, dto: AddressDto): Promise<import("../entities").Address>;
    update(user: User, id: string, dto: AddressDto): Promise<import("../entities").Address>;
    remove(user: User, id: string): Promise<{
        message: string;
    }>;
    setDefault(user: User, id: string): Promise<import("../entities").Address>;
}
export {};
