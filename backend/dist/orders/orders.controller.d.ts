import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order.dto';
import { OrderStatus, User } from '../entities';
export declare class OrdersController {
    private service;
    constructor(service: OrdersService);
    create(user: User, dto: CreateOrderDto): Promise<import("../entities").Order>;
    findAll(user: User, page?: number, limit?: number, status?: OrderStatus): Promise<{
        data: import("../entities").Order[];
        meta: import("../common/utils/pagination.util").PaginationMeta;
    }>;
    findOne(user: User, id: string): Promise<import("../entities").Order>;
    cancel(user: User, id: string): Promise<import("../entities").Order>;
}
declare class UpdateStatusDto {
    status: OrderStatus;
}
export declare class AdminOrdersController {
    private service;
    constructor(service: OrdersService);
    findAll(page?: number, limit?: number, status?: OrderStatus): Promise<{
        data: import("../entities").Order[];
        meta: import("../common/utils/pagination.util").PaginationMeta;
    }>;
    updateStatus(id: string, dto: UpdateStatusDto): Promise<import("../entities").Order>;
}
export {};
