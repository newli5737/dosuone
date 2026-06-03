import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductImage, ProductSpec, Review } from '../entities';
import { paginate, paginationMeta } from '../common/utils/pagination.util';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    @InjectRepository(ProductImage) private imagesRepo: Repository<ProductImage>,
    @InjectRepository(ProductSpec) private specsRepo: Repository<ProductSpec>,
    @InjectRepository(Review) private reviewsRepo: Repository<Review>,
  ) {}

  async findAll(query: ProductQueryDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const qb = this.productsRepo
      .createQueryBuilder('p')
      .where('p.is_active = true');

    if (query.category_id) qb.andWhere('p.category_id = :cid', { cid: query.category_id });
    if (query.search) {
      qb.andWhere('(p.name ILIKE :s OR p.brand ILIKE :s)', { s: `%${query.search}%` });
    }
    if (query.min_price) qb.andWhere('COALESCE(p.sale_price, p.price) >= :min', { min: query.min_price });
    if (query.max_price) qb.andWhere('COALESCE(p.sale_price, p.price) <= :max', { max: query.max_price });

    switch (query.sort) {
      case 'price_asc':
        qb.orderBy('COALESCE(p.sale_price, p.price)', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('COALESCE(p.sale_price, p.price)', 'DESC');
        break;
      case 'rating':
        qb.orderBy('p.avg_rating', 'DESC');
        break;
      default:
        qb.orderBy('p.created_at', 'DESC');
    }

    const [data, total] = await qb.skip(skip).take(take).getManyAndCount();
    return { data, meta: paginationMeta(page, limit, total) };
  }

  findFeatured() {
    return this.productsRepo.find({
      where: { isFeatured: true, isActive: true },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async findBySlug(slug: string) {
    const product = await this.productsRepo.findOne({
      where: { slug, isActive: true },
      relations: { category: true, images: true, specs: true },
      order: {
        images: { sortOrder: 'ASC' },
        specs: { sortOrder: 'ASC' },
      } as never,
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    return product;
  }

  async getReviews(productId: string, page = 1, limit = 20) {
    const product = await this.productsRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const [data, total] = await this.reviewsRepo.findAndCount({
      where: { productId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
    return {
      data: data.map((r) => ({
        ...r,
        user: r.user
          ? { id: r.user.id, full_name: r.user.fullName, avatar_url: r.user.avatarUrl }
          : null,
      })),
      meta: paginationMeta(p, l, total),
    };
  }

  async create(dto: CreateProductDto) {
    const product = await this.productsRepo.save(
      this.productsRepo.create({
        categoryId: dto.category_id,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        price: dto.price,
        salePrice: dto.sale_price,
        stock: dto.stock ?? 0,
        brand: dto.brand,
        thumbnailUrl: dto.thumbnail_url,
        isFeatured: dto.is_featured ?? false,
      }),
    );
    if (dto.images?.length) {
      await this.imagesRepo.save(
        dto.images.map((img, i) =>
          this.imagesRepo.create({
            productId: product.id,
            imageUrl: img.image_url,
            sortOrder: img.sort_order ?? i,
            isPrimary: img.is_primary ?? i === 0,
          }),
        ),
      );
    }
    if (dto.specs?.length) {
      await this.specsRepo.save(
        dto.specs.map((s, i) =>
          this.specsRepo.create({
            productId: product.id,
            specKey: s.spec_key,
            specValue: s.spec_value,
            sortOrder: s.sort_order ?? i,
          }),
        ),
      );
    }
    return this.findBySlug(product.slug);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    Object.assign(product, {
      ...(dto.category_id && { categoryId: dto.category_id }),
      ...(dto.name && { name: dto.name }),
      ...(dto.slug && { slug: dto.slug }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.sale_price !== undefined && { salePrice: dto.sale_price }),
      ...(dto.stock !== undefined && { stock: dto.stock }),
      ...(dto.brand !== undefined && { brand: dto.brand }),
      ...(dto.thumbnail_url !== undefined && { thumbnailUrl: dto.thumbnail_url }),
      ...(dto.is_featured !== undefined && { isFeatured: dto.is_featured }),
      ...(dto.is_active !== undefined && { isActive: dto.is_active }),
    });
    await this.productsRepo.save(product);
    return product;
  }

  async remove(id: string) {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    await this.productsRepo.remove(product);
    return { message: 'Đã xóa sản phẩm' };
  }
}
