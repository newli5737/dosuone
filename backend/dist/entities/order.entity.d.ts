import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus, PaymentMethod, PaymentStatus } from './enums';
export declare class Order {
    id: string;
    userId: string;
    user: User;
    orderCode: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    shippingAddress: Record<string, unknown>;
    note: string;
    createdAt: Date;
    updatedAt: Date;
    items: OrderItem[];
}
