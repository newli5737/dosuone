import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer, User } from '../entities';
import { CustomersService } from './customers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, User])],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
