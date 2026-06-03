import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { Between, LessThan, Repository } from 'typeorm';
import { Customer, Order, OrderStatus, Product, User, UserRole } from '../entities';
import { paginate, paginationMeta } from '../common/utils/pagination.util';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Order) private ordersRepo: Repository<Order>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Customer) private customersRepo: Repository<Customer>,
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

    const todayRevenue = await this.ordersRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'total')
      .where('o.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .andWhere('o.created_at >= :start', { start: startOfToday })
      .getRawOne();

    const totalOrders = await this.ordersRepo.count();
    const pendingOrders = await this.ordersRepo.count({ where: { status: OrderStatus.PENDING } });
    const totalUsers = await this.usersRepo.count();
    const inactiveProducts = await this.productsRepo.count({ where: { isActive: false } });
    const lowStockProducts = await this.productsRepo.count({
      where: { isActive: true, stock: LessThan(10) },
    });
    const featuredProducts = await this.productsRepo.count({ where: { isFeatured: true } });

    const statusRows = await this.ordersRepo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.status')
      .getRawMany();

    const ordersByStatus: Record<string, number> = {};
    for (const row of statusRows) {
      ordersByStatus[row.status] = Number(row.count);
    }

    return {
      month_revenue: Number(monthRevenue.total),
      today_revenue: Number(todayRevenue.total),
      today_orders: todayOrders,
      active_products: activeProducts,
      inactive_products: inactiveProducts,
      featured_products: featuredProducts,
      low_stock_products: lowStockProducts,
      new_users_week: newUsers,
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      total_users: totalUsers,
      orders_by_status: ordersByStatus,
    };
  }

  async lowStock(limit = 10) {
    const items = await this.productsRepo.find({
      where: { isActive: true, stock: LessThan(10) },
      relations: { brand: true },
      order: { stock: 'ASC' },
      take: limit,
    });
    return items.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand?.name ?? null,
      stock: p.stock,
      thumbnail_url: p.thumbnailUrl,
      price: Number(p.price),
    }));
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

  async listUsers(page = 1, limit = 20, role?: string) {
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where =
      role === 'admin'
        ? { role: UserRole.ADMIN }
        : role === 'customer'
          ? { role: UserRole.CUSTOMER }
          : {};
    const [data, total] = await this.usersRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
    return {
      data: data.map(({ password, refreshToken, ...u }) => u),
      meta: paginationMeta(p, l, total),
    };
  }

  async listCustomers(page = 1, limit = 20, search?: string) {
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const qb = this.customersRepo.createQueryBuilder('c').orderBy('c.last_order_at', 'DESC', 'NULLS LAST');
    if (search?.trim()) {
      const s = `%${search.trim()}%`;
      qb.andWhere(
        '(c.full_name ILIKE :s OR c.phone ILIKE :s OR c.email ILIKE :s)',
        { s },
      );
    }
    const [data, total] = await qb.skip(skip).take(take).getManyAndCount();
    return { data, meta: paginationMeta(p, l, total) };
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
