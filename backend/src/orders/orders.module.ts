import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Address,
  CartItem,
  Notification,
  Order,
  OrderItem,
  Product,
} from '../entities';
import { BankAccountsModule } from '../bank-accounts/bank-accounts.module';
import { AdminOrdersController, OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    BankAccountsModule,
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      CartItem,
      Address,
      Product,
      Notification,
    ]),
  ],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
