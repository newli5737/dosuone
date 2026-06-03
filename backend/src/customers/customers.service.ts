import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer, User } from '../entities';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) private customersRepo: Repository<Customer>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async recordFromOrder(
    userId: string,
    shippingAddress: Record<string, unknown>,
    orderTotal: number,
  ) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    const phone = String(shippingAddress.phone ?? user?.phone ?? '').trim();
    const fullName = String(shippingAddress.full_name ?? user?.fullName ?? '').trim();
    if (!phone || !fullName) return;

    let customer = await this.customersRepo.findOne({
      where: [{ userId }, { phone }],
      order: { createdAt: 'ASC' },
    });

    if (!customer) {
      customer = this.customersRepo.create({
        userId,
        email: user?.email ?? null,
        fullName,
        phone,
        orderCount: 0,
        totalSpent: 0,
        lastOrderAt: null,
      });
    } else if (!customer.userId) {
      customer.userId = userId;
    }

    customer.fullName = fullName;
    customer.phone = phone;
    if (user?.email) customer.email = user.email;
    customer.orderCount = Number(customer.orderCount) + 1;
    customer.totalSpent = Number(customer.totalSpent) + Number(orderTotal);
    customer.lastOrderAt = new Date();
    await this.customersRepo.save(customer);
  }
}
