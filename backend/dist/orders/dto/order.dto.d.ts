import { PaymentMethod } from '../../entities';
export declare class CreateOrderDto {
    address_id: string;
    payment_method: PaymentMethod;
    note?: string;
}
