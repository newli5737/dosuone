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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
let ReviewsService = class ReviewsService {
    constructor(reviewsRepo, orderItemsRepo, productsRepo) {
        this.reviewsRepo = reviewsRepo;
        this.orderItemsRepo = orderItemsRepo;
        this.productsRepo = productsRepo;
    }
    async updateProductRating(productId) {
        const result = await this.reviewsRepo
            .createQueryBuilder('r')
            .select('AVG(r.rating)', 'avg')
            .addSelect('COUNT(*)', 'count')
            .where('r.product_id = :productId', { productId })
            .getRawOne();
        await this.productsRepo.update(productId, {
            avgRating: Number(result.avg) || 0,
            reviewCount: Number(result.count) || 0,
        });
    }
    async create(userId, orderItemId, rating, comment) {
        const orderItem = await this.orderItemsRepo.findOne({
            where: { id: orderItemId },
            relations: { order: true },
        });
        if (!orderItem || orderItem.order.userId !== userId) {
            throw new common_1.NotFoundException('Sản phẩm đơn hàng không tồn tại');
        }
        if (orderItem.order.status !== entities_1.OrderStatus.DELIVERED) {
            throw new common_1.BadRequestException('Chỉ đánh giá được sau khi nhận hàng');
        }
        const existing = await this.reviewsRepo.findOne({ where: { orderItemId } });
        if (existing)
            throw new common_1.ConflictException('Đã đánh giá sản phẩm này');
        const review = await this.reviewsRepo.save(this.reviewsRepo.create({
            productId: orderItem.productId,
            userId,
            orderItemId,
            rating,
            comment,
        }));
        await this.updateProductRating(orderItem.productId);
        return review;
    }
    async update(userId, id, rating, comment) {
        const review = await this.reviewsRepo.findOne({ where: { id, userId } });
        if (!review)
            throw new common_1.NotFoundException('Review không tồn tại');
        if (rating)
            review.rating = rating;
        if (comment !== undefined)
            review.comment = comment;
        await this.reviewsRepo.save(review);
        await this.updateProductRating(review.productId);
        return review;
    }
    async remove(userId, id) {
        const review = await this.reviewsRepo.findOne({ where: { id, userId } });
        if (!review)
            throw new common_1.NotFoundException('Review không tồn tại');
        const productId = review.productId;
        await this.reviewsRepo.remove(review);
        await this.updateProductRating(productId);
        return { message: 'Đã xóa review' };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map