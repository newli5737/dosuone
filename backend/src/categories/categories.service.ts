import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, Product } from '../entities';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private repo: Repository<Category>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    private cloudinary: CloudinaryService,
  ) {}

  findAll(includeInactive = false) {
    return this.repo.find({
      where: includeInactive ? {} : { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findBySlug(slug: string) {
    const cat = await this.repo.findOne({ where: { slug, isActive: true } });
    if (!cat) throw new NotFoundException('Danh mục không tồn tại');
    return cat;
  }

  create(dto: CreateCategoryDto) {
    return this.repo.save(
      this.repo.create({
        name: dto.name,
        slug: dto.slug,
        imageUrl: dto.image_url,
        imagePublicId: dto.image_public_id,
      }),
    );
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Danh mục không tồn tại');

    const toDelete: string[] = [];
    if (dto.delete_image_public_id) toDelete.push(dto.delete_image_public_id);
    if (dto.image_url !== undefined && cat.imagePublicId && dto.image_public_id !== cat.imagePublicId) {
      toDelete.push(cat.imagePublicId);
    }
    if (toDelete.length) await this.cloudinary.destroyMany(toDelete);

    if (dto.name) cat.name = dto.name;
    if (dto.slug) cat.slug = dto.slug;
    if (dto.image_url !== undefined) cat.imageUrl = dto.image_url;
    if (dto.image_public_id !== undefined) cat.imagePublicId = dto.image_public_id;
    if (dto.is_active !== undefined) cat.isActive = dto.is_active;
    return this.repo.save(cat);
  }

  async remove(id: string) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Danh mục không tồn tại');

    const linked = await this.productsRepo.count({ where: { categoryId: id } });
    let moved = 0;
    let fallbackName = '';
    if (linked > 0) {
      const fallback =
        (await this.repo.findOne({ where: { slug: 'dien-thoai', isActive: true } })) ??
        (await this.repo.findOne({ where: { isActive: true }, order: { name: 'ASC' } }));
      if (!fallback || fallback.id === id) {
        throw new BadRequestException(
          `Còn ${linked} sản phẩm gắn danh mục này. Tạo danh mục "Điện thoại" (dien-thoai) hoặc xóa/chuyển sản phẩm trước.`,
        );
      }
      fallbackName = fallback.name;
      const result = await this.productsRepo.update(
        { categoryId: id },
        { categoryId: fallback.id },
      );
      moved = result.affected ?? linked;
    }

    if (cat.imagePublicId) await this.cloudinary.destroy(cat.imagePublicId);
    await this.repo.remove(cat);
    return {
      message:
        moved > 0
          ? `Đã xóa danh mục. ${moved} sản phẩm chuyển sang "${fallbackName}".`
          : 'Đã xóa danh mục',
      moved_products: moved,
    };
  }
}
