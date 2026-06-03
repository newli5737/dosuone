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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const dayjs_1 = __importDefault(require("dayjs"));
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const pagination_util_1 = require("../common/utils/pagination.util");
let AdminService = class AdminService {
    constructor(ordersRepo, productsRepo, usersRepo) {
        this.ordersRepo = ordersRepo;
        this.productsRepo = productsRepo;
        this.usersRepo = usersRepo;
    }
    async overview() {
        const startOfMonth = (0, dayjs_1.default)().startOf('month').toDate();
        const startOfToday = (0, dayjs_1.default)().startOf('day').toDate();
        const startOfWeek = (0, dayjs_1.default)().subtract(7, 'day').toDate();
        const monthRevenue = await this.ordersRepo
            .createQueryBuilder('o')
            .select('COALESCE(SUM(o.total), 0)', 'total')
            .where('o.status != :cancelled', { cancelled: entities_1.OrderStatus.CANCELLED })
            .andWhere('o.created_at >= :start', { start: startOfMonth })
            .getRawOne();
        const todayOrders = await this.ordersRepo.count({
            where: { createdAt: (0, typeorm_2.Between)(startOfToday, new Date()) },
        });
        const activeProducts = await this.productsRepo.count({
            where: { isActive: true },
        });
        const newUsers = await this.usersRepo.count({
            where: { createdAt: (0, typeorm_2.Between)(startOfWeek, new Date()) },
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
        const start = (0, dayjs_1.default)().subtract(days, 'day').startOf('day').toDate();
        const orders = await this.ordersRepo
            .createQueryBuilder('o')
            .select("DATE(o.created_at)", 'date')
            .addSelect('SUM(o.total)', 'revenue')
            .where('o.created_at >= :start', { start })
            .andWhere('o.status != :cancelled', { cancelled: entities_1.OrderStatus.CANCELLED })
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
            .where('o.status != :cancelled', { cancelled: entities_1.OrderStatus.CANCELLED })
            .groupBy('oi.product_id')
            .addGroupBy('oi.product_name')
            .orderBy('sold', 'DESC')
            .limit(5)
            .getRawMany();
    }
    async listUsers(page = 1, limit = 20) {
        const { skip, take, page: p, limit: l } = (0, pagination_util_1.paginate)(page, limit);
        const [data, total] = await this.usersRepo.findAndCount({
            order: { createdAt: 'DESC' },
            skip,
            take,
        });
        return {
            data: data.map(({ password, refreshToken, ...u }) => u),
            meta: (0, pagination_util_1.paginationMeta)(p, l, total),
        };
    }
    async updateUserStatus(id, isActive) {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User không tồn tại');
        user.isActive = isActive;
        await this.usersRepo.save(user);
        const { password, refreshToken, ...safe } = user;
        return safe;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map