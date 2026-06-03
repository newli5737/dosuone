import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem, Product } from '../entities';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem) private cartRepo: Repository<CartItem>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
  ) {}

  private mapItem(item: CartItem) {
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

  async getCart(userId: string) {
    const items = await this.cartRepo.find({
      where: { userId },
      relations: { product: true },
      order: { createdAt: 'DESC' },
    });
    const mapped = items.map((i) => this.mapItem(i));
    const subtotal = mapped.reduce((s, i) => s + i.line_total, 0);
    return { items: mapped, subtotal, item_count: mapped.length };
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await this.productsRepo.findOne({
      where: { id: productId, isActive: true },
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    if (product.stock < quantity) throw new BadRequestException('Không đủ hàng trong kho');

    let item = await this.cartRepo.findOne({ where: { userId, productId } });
    if (item) {
      item.quantity += quantity;
      if (item.quantity > product.stock) {
        throw new BadRequestException('Không đủ hàng trong kho');
      }
    } else {
      item = this.cartRepo.create({ userId, productId, quantity });
    }
    await this.cartRepo.save(item);
    return this.getCart(userId);
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    const item = await this.cartRepo.findOne({
      where: { userId, productId },
      relations: { product: true },
    });
    if (!item) throw new NotFoundException('Sản phẩm không có trong giỏ');
    if (quantity <= 0) {
      await this.cartRepo.remove(item);
      return this.getCart(userId);
    }
    if (item.product.stock < quantity) {
      throw new BadRequestException('Không đủ hàng trong kho');
    }
    item.quantity = quantity;
    await this.cartRepo.save(item);
    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    const item = await this.cartRepo.findOne({ where: { userId, productId } });
    if (!item) throw new NotFoundException('Sản phẩm không có trong giỏ');
    await this.cartRepo.remove(item);
    return this.getCart(userId);
  }

  async clear(userId: string) {
    await this.cartRepo.delete({ userId });
    return { message: 'Đã xóa giỏ hàng' };
  }
}
