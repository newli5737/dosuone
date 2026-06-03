import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Address,
  CartItem,
  Category,
  Brand,
  Customer,
  Notification,
  Order,
  OrderItem,
  Product,
  ProductImage,
  ProductSpec,
  Review,
  User,
  Wishlist,
  BankAccount,
} from './entities';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { CustomersModule } from './customers/customers.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { AddressesModule } from './addresses/addresses.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CloudinaryModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [
          User,
          Category,
          Brand,
          Customer,
          Product,
          ProductImage,
          ProductSpec,
          Address,
          Order,
          OrderItem,
          CartItem,
          Review,
          Wishlist,
          Notification,
          BankAccount,
        ],
        synchronize: true,
      }),
    }),
    AuthModule,
    CategoriesModule,
    BrandsModule,
    CustomersModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    ReviewsModule,
    WishlistModule,
    AddressesModule,
    NotificationsModule,
    AdminModule,
    BankAccountsModule,
  ],
})
export class AppModule {}
