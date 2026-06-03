import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Brand, Product, ProductImage, ProductSpec, Review } from '../entities';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { paginate, paginationMeta } from '../common/utils/pagination.util';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    @InjectRepository(Brand) private brandsRepo: Repository<Brand>,
    @InjectRepository(ProductImage) private imagesRepo: Repository<ProductImage>,
    @InjectRepository(ProductSpec) private specsRepo: Repository<ProductSpec>,
    @InjectRepository(Review) private reviewsRepo: Repository<Review>,
    private cloudinary: CloudinaryService,
  ) {}

  private toProductDto(p: Product, brandName: string | null = null) {
    return {
      id: p.id,
      category_id: p.categoryId,
      brand_id: p.brandId,
      name: p.name,
      slug: p.slug,
      description: p.description ?? null,
      price: Number(p.price),
      sale_price: p.salePrice != null ? Number(p.salePrice) : null,
      stock: p.stock,
      brand: brandName,
      thumbnail_url: p.thumbnailUrl ?? null,
      thumbnail_public_id: p.thumbnailPublicId ?? null,
      is_featured: p.isFeatured,
      is_active: p.isActive,
      avg_rating: Number(p.avgRating),
      review_count: p.reviewCount,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    };
  }

  private mapImages(images: ProductImage[] | undefined) {
    return (images ?? []).map((img) => ({
      id: img.id,
      image_url: img.imageUrl,
      cloudinary_public_id: img.cloudinaryPublicId,
      sort_order: img.sortOrder,
      is_primary: img.isPrimary,
    }));
  }

  private mapSpecs(specs: ProductSpec[] | undefined) {
    return (specs ?? []).map((s) => ({
      id: s.id,
      spec_key: s.specKey,
      spec_value: s.specValue,
      sort_order: s.sortOrder,
    }));
  }

  private async brandNameMap(ids: (string | null | undefined)[]) {
    const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
    const map = new Map<string, string>();
    if (!unique.length) return map;
    try {
      const rows = await this.brandsRepo.find({ where: { id: In(unique) } });
      for (const b of rows) map.set(b.id, b.name);
    } catch {
      /* bảng brands chưa sync — bỏ qua */
    }
    return map;
  }

  async findAll(query: ProductQueryDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const qb = this.productsRepo.createQueryBuilder('p');

    if (!query.include_inactive) {
      qb.where('p.is_active = :active', { active: true });
    }

    if (query.category_id) qb.andWhere('p.category_id = :cid', { cid: query.category_id });
    if (query.brand_id) qb.andWhere('p.brand_id = :bid', { bid: query.brand_id });
    if (query.search) {
      qb.andWhere('p.name ILIKE :s', { s: `%${query.search}%` });
    }
    if (query.min_price) {
      qb.andWhere('COALESCE(p.sale_price, p.price) >= :min', { min: query.min_price });
    }
    if (query.max_price) {
      qb.andWhere('COALESCE(p.sale_price, p.price) <= :max', { max: query.max_price });
    }

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

    const [rows, total] = await qb.skip(skip).take(take).getManyAndCount();
    const bmap = await this.brandNameMap(rows.map((r) => r.brandId));

    return {
      data: rows.map((p) =>
        this.toProductDto(p, p.brandId ? (bmap.get(p.brandId) ?? null) : null),
      ),
      meta: paginationMeta(page, limit, total),
    };
  }

  async findFeatured() {
    const rows = await this.productsRepo.find({
      where: { isFeatured: true, isActive: true },
      order: { createdAt: 'DESC' },
      take: 20,
    });
    const bmap = await this.brandNameMap(rows.map((r) => r.brandId));
    return rows.map((p) =>
      this.toProductDto(p, p.brandId ? (bmap.get(p.brandId) ?? null) : null),
    );
  }

  async findBySlug(slug: string) {
    const product = await this.productsRepo.findOne({
      where: { slug, isActive: true },
      relations: { images: true, specs: true },
      order: {
        images: { sortOrder: 'ASC' },
        specs: { sortOrder: 'ASC' },
      } as never,
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    const bmap = await this.brandNameMap([product.brandId]);
    return {
      ...this.toProductDto(
        product,
        product.brandId ? (bmap.get(product.brandId) ?? null) : null,
      ),
      images: this.mapImages(product.images),
      specs: this.mapSpecs(product.specs),
    };
  }

  async findByIdAdmin(id: string) {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: { images: true, category: true },
      order: { images: { sortOrder: 'ASC' } } as never,
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    const bmap = await this.brandNameMap([product.brandId]);
    return {
      ...this.toProductDto(
        product,
        product.brandId ? (bmap.get(product.brandId) ?? null) : null,
      ),
      images: this.mapImages(product.images),
      category: product.category
        ? { id: product.category.id, name: product.category.name, slug: product.category.slug }
        : null,
    };
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
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.createdAt,
        user: r.user
          ? { id: r.user.id, full_name: r.user.fullName, avatar_url: r.user.avatarUrl }
          : null,
      })),
      meta: paginationMeta(p, l, total),
    };
  }

  private resolveThumbnail(dto: {
    thumbnail_url?: string;
    thumbnail_public_id?: string;
    images?: { image_url: string; public_id?: string; is_primary?: boolean }[];
  }) {
    if (dto.thumbnail_url) {
      return { url: dto.thumbnail_url, publicId: dto.thumbnail_public_id };
    }
    const primary = dto.images?.find((i) => i.is_primary) ?? dto.images?.[0];
    if (primary) {
      return { url: primary.image_url, publicId: primary.public_id };
    }
    return { url: undefined as string | undefined, publicId: undefined as string | undefined };
  }

  async create(dto: CreateProductDto) {
    const thumb = this.resolveThumbnail(dto);
    const product = await this.productsRepo.save(
      this.productsRepo.create({
        categoryId: dto.category_id,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        price: dto.price,
        salePrice: dto.sale_price,
        stock: dto.stock ?? 0,
        brandId: dto.brand_id ?? null,
        thumbnailUrl: thumb.url,
        thumbnailPublicId: thumb.publicId,
        isFeatured: dto.is_featured ?? false,
      }),
    );
    if (dto.images?.length) {
      await this.imagesRepo.save(
        dto.images.map((img, i) =>
          this.imagesRepo.create({
            productId: product.id,
            imageUrl: img.image_url,
            cloudinaryPublicId: img.public_id,
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
    return this.findByIdAdmin(product.id);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: { images: true },
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    if (dto.delete_public_ids?.length) {
      await this.cloudinary.destroyMany(dto.delete_public_ids);
      await this.imagesRepo.delete({ cloudinaryPublicId: In(dto.delete_public_ids) });
      const remaining = await this.imagesRepo.find({ where: { productId: id } });
      if (!remaining.length) {
        if (product.thumbnailPublicId) await this.cloudinary.destroy(product.thumbnailPublicId);
        product.thumbnailUrl = null as never;
        product.thumbnailPublicId = null as never;
      }
    }

    if (dto.thumbnail_url !== undefined || dto.thumbnail_public_id !== undefined) {
      if (
        product.thumbnailPublicId &&
        dto.thumbnail_public_id &&
        product.thumbnailPublicId !== dto.thumbnail_public_id
      ) {
        await this.cloudinary.destroy(product.thumbnailPublicId);
      }
      product.thumbnailUrl = dto.thumbnail_url ?? product.thumbnailUrl;
      product.thumbnailPublicId = dto.thumbnail_public_id ?? product.thumbnailPublicId;
    }

    if (dto.images !== undefined) {
      const oldIds = product.images.map((i) => i.cloudinaryPublicId).filter(Boolean) as string[];
      const newIds = new Set(dto.images.map((i) => i.public_id).filter(Boolean));
      const removeIds = oldIds.filter((pid) => !newIds.has(pid));
      if (removeIds.length) {
        await this.cloudinary.destroyMany(removeIds);
      }
      await this.imagesRepo.delete({ productId: id });
      if (dto.images.length) {
        await this.imagesRepo.save(
          dto.images.map((img, i) =>
            this.imagesRepo.create({
              productId: id,
              imageUrl: img.image_url,
              cloudinaryPublicId: img.public_id,
              sortOrder: img.sort_order ?? i,
              isPrimary: img.is_primary ?? i === 0,
            }),
          ),
        );
      }
      const thumb = this.resolveThumbnail({ ...dto, images: dto.images });
      if (thumb.url) {
        product.thumbnailUrl = thumb.url;
        product.thumbnailPublicId = thumb.publicId ?? product.thumbnailPublicId;
      }
    }

    Object.assign(product, {
      ...(dto.category_id && { categoryId: dto.category_id }),
      ...(dto.name && { name: dto.name }),
      ...(dto.slug && { slug: dto.slug }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.sale_price !== undefined && { salePrice: dto.sale_price }),
      ...(dto.stock !== undefined && { stock: dto.stock }),
      ...(dto.brand_id !== undefined && { brandId: dto.brand_id || null }),
      ...(dto.is_featured !== undefined && { isFeatured: dto.is_featured }),
      ...(dto.is_active !== undefined && { isActive: dto.is_active }),
    });
    await this.productsRepo.save(product);
    return this.findByIdAdmin(id);
  }

  async remove(id: string) {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: { images: true },
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    const publicIds = [
      ...(product.thumbnailPublicId ? [product.thumbnailPublicId] : []),
      ...product.images.map((i) => i.cloudinaryPublicId).filter(Boolean),
    ] as string[];
    if (publicIds.length) await this.cloudinary.destroyMany(publicIds);

    await this.productsRepo.remove(product);
    return { message: 'Đã xóa sản phẩm' };
  }
}
