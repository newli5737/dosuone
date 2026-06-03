import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  Address,
  CartItem,
  Notification,
  NotificationType,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Product,
  User,
} from '../entities';
import { BankAccountsService } from '../bank-accounts/bank-accounts.service';
import { CustomersService } from '../customers/customers.service';
import { calcShippingFee, generateOrderCode } from '../common/utils/order-code.util';
import { paginate, paginationMeta } from '../common/utils/pagination.util';
import { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order) private ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemsRepo: Repository<OrderItem>,
    @InjectRepository(CartItem) private cartRepo: Repository<CartItem>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    private bankAccountsService: BankAccountsService,
    private customersService: CustomersService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const cartItems = await this.cartRepo.find({
      where: { userId },
      relations: { product: true },
    });
    if (!cartItems.length) throw new BadRequestException('Giỏ hàng trống');

    const address = await this.addressRepo.findOne({
      where: { id: dto.address_id, userId },
    });
    if (!address) throw new NotFoundException('Địa chỉ không tồn tại');

    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(`Sản phẩm "${item.product.name}" không đủ hàng`);
      }
    }

    const shippingAddress = {
      full_name: address.fullName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      address_detail: address.addressDetail,
    };

    return this.dataSource.transaction(async (manager) => {
      let subtotal = 0;
      const orderItemsData: Partial<OrderItem>[] = [];

      for (const item of cartItems) {
        const price = Number(item.product.salePrice ?? item.product.price);
        const total = price * item.quantity;
        subtotal += total;
        orderItemsData.push({
          productId: item.productId,
          productName: item.product.name,
          productImage: item.product.thumbnailUrl,
          price,
          quantity: item.quantity,
          total,
        });
        await manager.decrement(Product, { id: item.productId }, 'stock', item.quantity);
      }

      const shippingFee = calcShippingFee(subtotal);
      const total = subtotal + shippingFee;

      const order = manager.create(Order, {
        userId,
        orderCode: generateOrderCode(),
        status: OrderStatus.PENDING,
        paymentMethod: dto.payment_method,
        paymentStatus: PaymentStatus.UNPAID,
        subtotal,
        shippingFee,
        discount: 0,
        total,
        shippingAddress,
        note: dto.note,
      });
      const savedOrder = await manager.save(order);

      for (const oi of orderItemsData) {
        await manager.save(OrderItem, { ...oi, orderId: savedOrder.id });
      }

      await manager.delete(CartItem, { userId });

      await manager.save(Notification, {
        userId,
        title: 'Đặt hàng thành công',
        body: `Đơn hàng ${savedOrder.orderCode} đã được tạo thành công`,
        type: NotificationType.ORDER_UPDATE,
        data: { order_id: savedOrder.id },
      });

      await this.customersService.recordFromOrder(userId, shippingAddress, total);

      const fullOrder = await manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: { items: true },
      });
      if (!fullOrder) throw new BadRequestException('Không tạo được đơn hàng');

      const bankPayment = await this.bankAccountsService.buildForOrder(
        dto.payment_method as PaymentMethod,
        fullOrder.orderCode,
        Number(fullOrder.total),
      );

      return {
        ...fullOrder,
        bank_payment: bankPayment,
      };
    });
  }

  async findByUser(userId: string, page = 1, limit = 20, status?: OrderStatus) {
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;
    const [data, total] = await this.ordersRepo.findAndCount({
      where,
      relations: { items: true },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
    return { data, meta: paginationMeta(p, l, total) };
  }

  async findOne(userId: string, id: string) {
    const order = await this.ordersRepo.findOne({
      where: { id, userId },
      relations: { items: true },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    const bankPayment = await this.bankAccountsService.buildForOrderOptional(
      order.paymentMethod,
      order.orderCode,
      Number(order.total),
    );
    return bankPayment ? { ...order, bank_payment: bankPayment } : order;
  }

  async cancel(userId: string, id: string) {
    const order = await this.findOne(userId, id);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Chỉ hủy được đơn đang chờ xác nhận');
    }
    order.status = OrderStatus.CANCELLED;
    await this.ordersRepo.save(order);
    return order;
  }

  async adminFindAll(page = 1, limit = 20, status?: OrderStatus) {
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    const [data, total] = await this.ordersRepo.findAndCount({
      where,
      relations: { items: true, user: true },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
    return { data, meta: paginationMeta(p, l, total) };
  }

  async adminUpdateStatus(id: string, status: OrderStatus) {
    const order = await this.ordersRepo.findOne({ where: { id }, relations: { user: true } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    order.status = status;
    await this.ordersRepo.save(order);
    await this.notifRepo.save({
      userId: order.userId,
      title: 'Cập nhật đơn hàng',
      body: `Đơn hàng ${order.orderCode} đã chuyển sang trạng thái ${status}`,
      type: NotificationType.ORDER_UPDATE,
      data: { order_id: order.id, status },
    });
    return order;
  }
}
