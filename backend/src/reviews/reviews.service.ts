import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem, OrderStatus, Product, Review } from '../entities';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewsRepo: Repository<Review>,
    @InjectRepository(OrderItem) private orderItemsRepo: Repository<OrderItem>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
  ) {}

  private async updateProductRating(productId: string) {
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

  async create(userId: string, orderItemId: string, rating: number, comment?: string) {
    const orderItem = await this.orderItemsRepo.findOne({
      where: { id: orderItemId },
      relations: { order: true },
    });
    if (!orderItem || orderItem.order.userId !== userId) {
      throw new NotFoundException('Sản phẩm đơn hàng không tồn tại');
    }
    if (orderItem.order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Chỉ đánh giá được sau khi nhận hàng');
    }
    const existing = await this.reviewsRepo.findOne({ where: { orderItemId } });
    if (existing) throw new ConflictException('Đã đánh giá sản phẩm này');

    const review = await this.reviewsRepo.save(
      this.reviewsRepo.create({
        productId: orderItem.productId,
        userId,
        orderItemId,
        rating,
        comment,
      }),
    );
    await this.updateProductRating(orderItem.productId);
    return review;
  }

  async update(userId: string, id: string, rating?: number, comment?: string) {
    const review = await this.reviewsRepo.findOne({ where: { id, userId } });
    if (!review) throw new NotFoundException('Review không tồn tại');
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await this.reviewsRepo.save(review);
    await this.updateProductRating(review.productId);
    return review;
  }

  async remove(userId: string, id: string) {
    const review = await this.reviewsRepo.findOne({ where: { id, userId } });
    if (!review) throw new NotFoundException('Review không tồn tại');
    const productId = review.productId;
    await this.reviewsRepo.remove(review);
    await this.updateProductRating(productId);
    return { message: 'Đã xóa review' };
  }
}
