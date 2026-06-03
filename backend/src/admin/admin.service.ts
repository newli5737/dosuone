import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { Between, Repository } from 'typeorm';
import { Order, OrderStatus, Product, User } from '../entities';
import { paginate, paginationMeta } from '../common/utils/pagination.util';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Order) private ordersRepo: Repository<Order>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async overview() {
    const startOfMonth = dayjs().startOf('month').toDate();
    const startOfToday = dayjs().startOf('day').toDate();
    const startOfWeek = dayjs().subtract(7, 'day').toDate();

    const monthRevenue = await this.ordersRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'total')
      .where('o.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .andWhere('o.created_at >= :start', { start: startOfMonth })
      .getRawOne();

    const todayOrders = await this.ordersRepo.count({
      where: { createdAt: Between(startOfToday, new Date()) },
    });

    const activeProducts = await this.productsRepo.count({
      where: { isActive: true },
    });

    const newUsers = await this.usersRepo.count({
      where: { createdAt: Between(startOfWeek, new Date()) },
    });

    return {
      month_revenue: Number(monthRevenue.total),
      today_orders: todayOrders,
      active_products: activeProducts,
      new_users_week: newUsers,
    };
  }

  async revenue(period = '30d') {
    const days = period === '30d' ? 30 : 7;
    const start = dayjs().subtract(days, 'day').startOf('day').toDate();
    const orders = await this.ordersRepo
      .createQueryBuilder('o')
      .select("DATE(o.created_at)", 'date')
      .addSelect('SUM(o.total)', 'revenue')
      .where('o.created_at >= :start', { start })
      .andWhere('o.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .groupBy("DATE(o.created_at)")
      .orderBy('date', 'ASC')
      .getRawMany();
    return orders.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue),
    }));
  }

  async topProducts() {
    return this.ordersRepo
      .createQueryBuilder('o')
      .innerJoin('o.items', 'oi')
      .select('oi.product_id', 'product_id')
      .addSelect('oi.product_name', 'product_name')
      .addSelect('SUM(oi.quantity)', 'sold')
      .addSelect('SUM(oi.total)', 'revenue')
      .where('o.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .groupBy('oi.product_id')
      .addGroupBy('oi.product_name')
      .orderBy('sold', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async listUsers(page = 1, limit = 20) {
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const [data, total] = await this.usersRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
    return {
      data: data.map(({ password, refreshToken, ...u }) => u),
      meta: paginationMeta(p, l, total),
    };
  }

  async updateUserStatus(id: string, isActive: boolean) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User không tồn tại');
    user.isActive = isActive;
    await this.usersRepo.save(user);
    const { password, refreshToken, ...safe } = user;
    return safe;
  }
}
