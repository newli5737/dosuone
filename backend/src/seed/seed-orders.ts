import * as bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import { Repository } from 'typeorm';
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Product,
  User,
  UserRole,
} from '../entities';
import { calcShippingFee } from '../common/utils/order-code.util';
import { CustomersService } from '../customers/customers.service';

const EXTRA_CUSTOMERS = [
  { email: 'khach.le@example.com', password: 'customer123', fullName: 'Lê Thị Mai', phone: '0905123456' },
  { email: 'tran.minh@example.com', password: 'customer123', fullName: 'Trần Minh Đức', phone: '0918765432' },
  { email: 'pham.ha@example.com', password: 'customer123', fullName: 'Phạm Thu Hà', phone: '0933456789' },
  { email: 'hoang.kien@example.com', password: 'customer123', fullName: 'Hoàng Kiên', phone: '0977123987' },
  { email: 'vu.lan@example.com', password: 'customer123', fullName: 'Vũ Ngọc Lan', phone: '0988234567' },
  { email: 'dang.tuan@example.com', password: 'customer123', fullName: 'Đặng Anh Tuấn', phone: '0965345678' },
];

const WARDS = ['Phường Bến Nghé', 'Phường 12', 'Phường 7', 'Phường Láng Thượng', 'Phường 5'];

type StatusPick = {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  weight: number;
};

const STATUS_POOL: StatusPick[] = [
  { status: OrderStatus.DELIVERED, paymentStatus: PaymentStatus.PAID, weight: 42 },
  { status: OrderStatus.SHIPPING, paymentStatus: PaymentStatus.PAID, weight: 12 },
  { status: OrderStatus.CONFIRMED, paymentStatus: PaymentStatus.PAID, weight: 10 },
  { status: OrderStatus.PENDING, paymentStatus: PaymentStatus.UNPAID, weight: 14 },
  { status: OrderStatus.CANCELLED, paymentStatus: PaymentStatus.UNPAID, weight: 8 },
];

function pickStatus(): StatusPick {
  const total = STATUS_POOL.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const item of STATUS_POOL) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return STATUS_POOL[0];
}

function pickPaymentMethod(): PaymentMethod {
  const r = Math.random();
  if (r < 0.55) return PaymentMethod.COD;
  if (r < 0.85) return PaymentMethod.BANK_TRANSFER;
  return PaymentMethod.MOMO;
}

function randomDateInLastDays(days: number): Date {
  const d = dayjs()
    .subtract(Math.floor(Math.random() * days), 'day')
    .hour(8 + Math.floor(Math.random() * 12))
    .minute(Math.floor(Math.random() * 60))
    .second(0);
  return d.toDate();
}

export async function seedOrdersData(deps: {
  usersRepo: Repository<User>;
  productsRepo: Repository<Product>;
  ordersRepo: Repository<Order>;
  orderItemsRepo: Repository<OrderItem>;
  customersService: CustomersService;
}) {
  const { usersRepo, productsRepo, ordersRepo, orderItemsRepo, customersService } = deps;

  const monthStart = dayjs().startOf('month').toDate();
  const recentCount = await ordersRepo
    .createQueryBuilder('o')
    .where('o.created_at >= :start', { start: monthStart })
    .getCount();

  if (recentCount >= 15) {
    console.log(`  ○ Đã có ${recentCount} đơn trong tháng — bỏ qua seed đơn hàng`);
    return;
  }

  console.log('\n📦 Đơn hàng & khách hàng (30 ngày)…');

  const users: User[] = [];
  let main = await usersRepo.findOne({ where: { email: 'customer@dosuone.com' } });
  if (!main) {
    main = await usersRepo.save(
      usersRepo.create({
        email: 'customer@dosuone.com',
        password: await bcrypt.hash('customer123', 10),
        fullName: 'Nguyễn Văn Khách',
        phone: '0901234567',
        role: UserRole.CUSTOMER,
      }),
    );
  } else if (!main.phone) {
    main.phone = '0901234567';
    await usersRepo.save(main);
  }
  users.push(main);

  for (const c of EXTRA_CUSTOMERS) {
    let u = await usersRepo.findOne({ where: { email: c.email } });
    if (!u) {
      u = await usersRepo.save(
        usersRepo.create({
          email: c.email,
          password: await bcrypt.hash(c.password, 10),
          fullName: c.fullName,
          phone: c.phone,
          role: UserRole.CUSTOMER,
        }),
      );
      console.log(`  + Khách ${c.fullName}`);
    } else {
      u.fullName = c.fullName;
      u.phone = c.phone;
      await usersRepo.save(u);
    }
    users.push(u);
  }

  const products = await productsRepo.find({ where: { isActive: true } });
  if (!products.length) {
    console.log('  ! Chưa có sản phẩm — bỏ qua seed đơn');
    return;
  }

  const orderTarget = 38;
  const usedCodes = new Set<string>();
  let created = 0;

  for (let i = 0; i < orderTarget; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const itemCount = 1 + Math.floor(Math.random() * 2);
    const picked = new Set<number>();
    const lines: { product: Product; qty: number; price: number; total: number }[] = [];

    while (picked.size < itemCount) {
      const idx = Math.floor(Math.random() * products.length);
      if (picked.has(idx)) continue;
      picked.add(idx);
      const product = products[idx];
      const qty = 1 + Math.floor(Math.random() * 2);
      const price = Number(product.salePrice ?? product.price);
      lines.push({ product, qty, price, total: price * qty });
    }

    const subtotal = lines.reduce((s, l) => s + l.total, 0);
    const shippingFee = calcShippingFee(subtotal);
    const discount = Math.random() < 0.12 ? Math.min(200000, Math.floor(subtotal * 0.05)) : 0;
    const total = subtotal - discount + shippingFee;

    const { status, paymentStatus } = pickStatus();
    const createdAt = randomDateInLastDays(30);

    let orderCode: string;
    do {
      orderCode = `DH${dayjs(createdAt).format('YYYYMMDD')}${String(1000 + i).padStart(4, '0')}`;
    } while (usedCodes.has(orderCode));
    usedCodes.add(orderCode);

    const district = ['Quận 1', 'Quận 3', 'Quận 7', 'Cầu Giấy', 'Đống Đa'][i % 5];
    const shippingAddress = {
      full_name: user.fullName,
      phone: user.phone ?? '0900000000',
      province: 'TP. Hồ Chí Minh',
      district,
      ward: WARDS[i % WARDS.length],
      address_detail: `${10 + i} Đường ${['Nguyễn Huệ', 'Lê Lợi', '3/2', 'Láng', 'Võ Văn Tần'][i % 5]}`,
    };

    const order = await ordersRepo.save(
      ordersRepo.create({
        userId: user.id,
        orderCode,
        status,
        paymentMethod: pickPaymentMethod(),
        paymentStatus,
        subtotal,
        shippingFee,
        discount,
        total,
        shippingAddress,
        note: i % 5 === 0 ? 'Giao giờ hành chính' : undefined,
      }),
    );

    await ordersRepo.update(order.id, { createdAt, updatedAt: createdAt });

    for (const line of lines) {
      await orderItemsRepo.save(
        orderItemsRepo.create({
          orderId: order.id,
          productId: line.product.id,
          productName: line.product.name,
          productImage: line.product.thumbnailUrl,
          price: line.price,
          quantity: line.qty,
          total: line.total,
        }),
      );
    }

    if (status !== OrderStatus.CANCELLED) {
      await customersService.recordFromOrder(user.id, shippingAddress, total);
    }

    created++;
  }

  console.log(`  ✓ ${created} đơn hàng (${users.length} khách)`);
}
