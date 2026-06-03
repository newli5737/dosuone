import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

  findAll() {
    return this.repo.find({ where: { isActive: true }, order: { name: 'ASC' } });
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
      }),
    );
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Danh mục không tồn tại');
    if (dto.name) cat.name = dto.name;
    if (dto.slug) cat.slug = dto.slug;
    if (dto.image_url !== undefined) cat.imageUrl = dto.image_url;
    if (dto.is_active !== undefined) cat.isActive = dto.is_active;
    return this.repo.save(cat);
  }

  async remove(id: string) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Danh mục không tồn tại');
    await this.repo.remove(cat);
    return { message: 'Đã xóa danh mục' };
  }
}
