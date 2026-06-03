import { DataSource, Repository } from 'typeorm';
import { Address, CartItem, Notification, Order, OrderItem, OrderStatus, Product } from '../entities';
import { CreateOrderDto } from './dto/order.dto';
export declare class OrdersService {
    private dataSource;
    private ordersRepo;
    private orderItemsRepo;
    private cartRepo;
    private addressRepo;
    private productsRepo;
    private notifRepo;
    constructor(dataSource: DataSource, ordersRepo: Repository<Order>, orderItemsRepo: Repository<OrderItem>, cartRepo: Repository<CartItem>, addressRepo: Repository<Address>, productsRepo: Repository<Product>, notifRepo: Repository<Notification>);
    create(userId: string, dto: CreateOrderDto): Promise<Order>;
    findByUser(userId: string, page?: number, limit?: number, status?: OrderStatus): Promise<{
        data: Order[];
        meta: import("../common/utils/pagination.util").PaginationMeta;
    }>;
    findOne(userId: string, id: string): Promise<Order>;
    cancel(userId: string, id: string): Promise<Order>;
    adminFindAll(page?: number, limit?: number, status?: OrderStatus): Promise<{
        data: Order[];
        meta: import("../common/utils/pagination.util").PaginationMeta;
    }>;
    adminUpdateStatus(id: string, status: OrderStatus): Promise<Order>;
}
