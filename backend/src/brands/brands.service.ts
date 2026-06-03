import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@Injectable()
export class BrandsService {
  constructor(@InjectRepository(Brand) private repo: Repository<Brand>) {}

  findAll(includeInactive = false) {
    return this.repo.find({
      where: includeInactive ? {} : { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findBySlug(slug: string) {
    const brand = await this.repo.findOne({ where: { slug, isActive: true } });
    if (!brand) throw new NotFoundException('Thương hiệu không tồn tại');
    return brand;
  }

  create(dto: CreateBrandDto) {
    return this.repo.save(this.repo.create({ name: dto.name, slug: dto.slug }));
  }

  async update(id: string, dto: UpdateBrandDto) {
    const brand = await this.repo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('Thương hiệu không tồn tại');
    if (dto.name) brand.name = dto.name;
    if (dto.slug) brand.slug = dto.slug;
    if (dto.is_active !== undefined) brand.isActive = dto.is_active;
    return this.repo.save(brand);
  }

  async remove(id: string) {
    const brand = await this.repo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('Thương hiệu không tồn tại');
    await this.repo.remove(brand);
    return { message: 'Đã xóa thương hiệu' };
  }
}
