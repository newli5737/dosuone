"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const order_code_util_1 = require("../common/utils/order-code.util");
const pagination_util_1 = require("../common/utils/pagination.util");
let OrdersService = class OrdersService {
    constructor(dataSource, ordersRepo, orderItemsRepo, cartRepo, addressRepo, productsRepo, notifRepo) {
        this.dataSource = dataSource;
        this.ordersRepo = ordersRepo;
        this.orderItemsRepo = orderItemsRepo;
        this.cartRepo = cartRepo;
        this.addressRepo = addressRepo;
        this.productsRepo = productsRepo;
        this.notifRepo = notifRepo;
    }
    async create(userId, dto) {
        const cartItems = await this.cartRepo.find({
            where: { userId },
            relations: { product: true },
        });
        if (!cartItems.length)
            throw new common_1.BadRequestException('Giỏ hàng trống');
        const address = await this.addressRepo.findOne({
            where: { id: dto.address_id, userId },
        });
        if (!address)
            throw new common_1.NotFoundException('Địa chỉ không tồn tại');
        for (const item of cartItems) {
            if (item.product.stock < item.quantity) {
                throw new common_1.BadRequestException(`Sản phẩm "${item.product.name}" không đủ hàng`);
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
            const orderItemsData = [];
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
                await manager.decrement(entities_1.Product, { id: item.productId }, 'stock', item.quantity);
            }
            const shippingFee = (0, order_code_util_1.calcShippingFee)(subtotal);
            const total = subtotal + shippingFee;
            const order = manager.create(entities_1.Order, {
                userId,
                orderCode: (0, order_code_util_1.generateOrderCode)(),
                status: entities_1.OrderStatus.PENDING,
                paymentMethod: dto.payment_method,
                paymentStatus: entities_1.PaymentStatus.UNPAID,
                subtotal,
                shippingFee,
                discount: 0,
                total,
                shippingAddress,
                note: dto.note,
            });
            const savedOrder = await manager.save(order);
            for (const oi of orderItemsData) {
                await manager.save(entities_1.OrderItem, { ...oi, orderId: savedOrder.id });
            }
            await manager.delete(entities_1.CartItem, { userId });
            await manager.save(entities_1.Notification, {
                userId,
                title: 'Đặt hàng thành công',
                body: `Đơn hàng ${savedOrder.orderCode} đã được tạo thành công`,
                type: entities_1.NotificationType.ORDER_UPDATE,
                data: { order_id: savedOrder.id },
            });
            return manager.findOne(entities_1.Order, {
                where: { id: savedOrder.id },
                relations: { items: true },
            });
        });
    }
    async findByUser(userId, page = 1, limit = 20, status) {
        const { skip, take, page: p, limit: l } = (0, pagination_util_1.paginate)(page, limit);
        const where = { userId };
        if (status)
            where.status = status;
        const [data, total] = await this.ordersRepo.findAndCount({
            where,
            relations: { items: true },
            order: { createdAt: 'DESC' },
            skip,
            take,
        });
        return { data, meta: (0, pagination_util_1.paginationMeta)(p, l, total) };
    }
    async findOne(userId, id) {
        const order = await this.ordersRepo.findOne({
            where: { id, userId },
            relations: { items: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Đơn hàng không tồn tại');
        return order;
    }
    async cancel(userId, id) {
        const order = await this.findOne(userId, id);
        if (order.status !== entities_1.OrderStatus.PENDING) {
            throw new common_1.BadRequestException('Chỉ hủy được đơn đang chờ xác nhận');
        }
        order.status = entities_1.OrderStatus.CANCELLED;
        await this.ordersRepo.save(order);
        return order;
    }
    async adminFindAll(page = 1, limit = 20, status) {
        const { skip, take, page: p, limit: l } = (0, pagination_util_1.paginate)(page, limit);
        const where = {};
        if (status)
            where.status = status;
        const [data, total] = await this.ordersRepo.findAndCount({
            where,
            relations: { items: true, user: true },
            order: { createdAt: 'DESC' },
            skip,
            take,
        });
        return { data, meta: (0, pagination_util_1.paginationMeta)(p, l, total) };
    }
    async adminUpdateStatus(id, status) {
        const order = await this.ordersRepo.findOne({ where: { id }, relations: { user: true } });
        if (!order)
            throw new common_1.NotFoundException('Đơn hàng không tồn tại');
        order.status = status;
        await this.ordersRepo.save(order);
        await this.notifRepo.save({
            userId: order.userId,
            title: 'Cập nhật đơn hàng',
            body: `Đơn hàng ${order.orderCode} đã chuyển sang trạng thái ${status}`,
            type: entities_1.NotificationType.ORDER_UPDATE,
            data: { order_id: order.id, status },
        });
        return order;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.OrderItem)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.CartItem)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.Address)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.Product)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map