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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const pagination_util_1 = require("../common/utils/pagination.util");
let NotificationsService = class NotificationsService {
    constructor(repo) {
        this.repo = repo;
    }
    async findAll(userId, page = 1, limit = 20) {
        const { skip, take, page: p, limit: l } = (0, pagination_util_1.paginate)(page, limit);
        const [data, total] = await this.repo.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip,
            take,
        });
        return { data, meta: (0, pagination_util_1.paginationMeta)(p, l, total) };
    }
    async markRead(userId, id) {
        const n = await this.repo.findOne({ where: { id, userId } });
        if (!n)
            throw new common_1.NotFoundException('Thông báo không tồn tại');
        n.isRead = true;
        return this.repo.save(n);
    }
    async markAllRead(userId) {
        await this.repo.update({ userId, isRead: false }, { isRead: true });
        return { message: 'Đã đánh dấu tất cả đã đọc' };
    }
    unreadCount(userId) {
        return this.repo.count({ where: { userId, isRead: false } }).then((count) => ({ count }));
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map