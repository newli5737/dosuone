import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer, Order, Product, User } from '../entities';
import { BankAccountsModule } from '../bank-accounts/bank-accounts.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, User, Customer]), BankAccountsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
