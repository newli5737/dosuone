import { Repository } from 'typeorm';
import { Address } from '../entities';
export declare class AddressesService {
    private repo;
    constructor(repo: Repository<Address>);
    findAll(userId: string): Promise<Address[]>;
    create(userId: string, dto: Partial<Address>): Promise<Address>;
    update(userId: string, id: string, dto: Partial<Address>): Promise<Address>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
    setDefault(userId: string, id: string): Promise<Address>;
}
