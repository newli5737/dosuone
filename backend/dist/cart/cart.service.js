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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
let CartService = class CartService {
    constructor(cartRepo, productsRepo) {
        this.cartRepo = cartRepo;
        this.productsRepo = productsRepo;
    }
    mapItem(item) {
        const p = item.product;
        const price = Number(p.salePrice ?? p.price);
        return {
            id: item.id,
            product_id: item.productId,
            quantity: item.quantity,
            product: {
                id: p.id,
                name: p.name,
                slug: p.slug,
                thumbnail_url: p.thumbnailUrl,
                price: Number(p.price),
                sale_price: p.salePrice ? Number(p.salePrice) : null,
                effective_price: price,
                stock: p.stock,
            },
            line_total: price * item.quantity,
        };
    }
    async getCart(userId) {
        const items = await this.cartRepo.find({
            where: { userId },
            relations: { product: true },
            order: { createdAt: 'DESC' },
        });
        const mapped = items.map((i) => this.mapItem(i));
        const subtotal = mapped.reduce((s, i) => s + i.line_total, 0);
        return { items: mapped, subtotal, item_count: mapped.length };
    }
    async addItem(userId, productId, quantity) {
        const product = await this.productsRepo.findOne({
            where: { id: productId, isActive: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Sản phẩm không tồn tại');
        if (product.stock < quantity)
            throw new common_1.BadRequestException('Không đủ hàng trong kho');
        let item = await this.cartRepo.findOne({ where: { userId, productId } });
        if (item) {
            item.quantity += quantity;
            if (item.quantity > product.stock) {
                throw new common_1.BadRequestException('Không đủ hàng trong kho');
            }
        }
        else {
            item = this.cartRepo.create({ userId, productId, quantity });
        }
        await this.cartRepo.save(item);
        return this.getCart(userId);
    }
    async updateQuantity(userId, productId, quantity) {
        const item = await this.cartRepo.findOne({
            where: { userId, productId },
            relations: { product: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Sản phẩm không có trong giỏ');
        if (quantity <= 0) {
            await this.cartRepo.remove(item);
            return this.getCart(userId);
        }
        if (item.product.stock < quantity) {
            throw new common_1.BadRequestException('Không đủ hàng trong kho');
        }
        item.quantity = quantity;
        await this.cartRepo.save(item);
        return this.getCart(userId);
    }
    async removeItem(userId, productId) {
        const item = await this.cartRepo.findOne({ where: { userId, productId } });
        if (!item)
            throw new common_1.NotFoundException('Sản phẩm không có trong giỏ');
        await this.cartRepo.remove(item);
        return this.getCart(userId);
    }
    async clear(userId) {
        await this.cartRepo.delete({ userId });
        return { message: 'Đã xóa giỏ hàng' };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.CartItem)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CartService);
//# sourceMappingURL=cart.service.js.map