import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, Wishlist } from '../entities';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist) private wishlistRepo: Repository<Wishlist>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
  ) {}

  async findAll(userId: string) {
    const items = await this.wishlistRepo.find({
      where: { userId },
      relations: { product: true },
      order: { createdAt: 'DESC' },
    });
    return items.map((w) => w.product);
  }

  async add(userId: string, productId: string) {
    const product = await this.productsRepo.findOne({
      where: { id: productId, isActive: true },
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    const exists = await this.wishlistRepo.findOne({ where: { userId, productId } });
    if (exists) throw new ConflictException('Đã có trong danh sách yêu thích');
    await this.wishlistRepo.save(this.wishlistRepo.create({ userId, productId }));
    return this.findAll(userId);
  }

  async remove(userId: string, productId: string) {
    const item = await this.wishlistRepo.findOne({ where: { userId, productId } });
    if (!item) throw new NotFoundException('Không có trong danh sách yêu thích');
    await this.wishlistRepo.remove(item);
    return this.findAll(userId);
  }
}
