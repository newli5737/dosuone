import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../entities';

@Injectable()
export class AddressesService {
  constructor(@InjectRepository(Address) private repo: Repository<Address>) {}

  findAll(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { isDefault: 'DESC', fullName: 'ASC' },
    });
  }

  async create(userId: string, dto: Partial<Address>) {
    if (dto.isDefault) {
      await this.repo.update({ userId }, { isDefault: false });
    }
    const count = await this.repo.count({ where: { userId } });
    const address = this.repo.create({
      userId,
      fullName: dto.fullName!,
      phone: dto.phone!,
      province: dto.province!,
      district: dto.district!,
      ward: dto.ward!,
      addressDetail: dto.addressDetail!,
      isDefault: dto.isDefault ?? count === 0,
    });
    return this.repo.save(address);
  }

  async update(userId: string, id: string, dto: Partial<Address>) {
    const address = await this.repo.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Địa chỉ không tồn tại');
    if (dto.isDefault) await this.repo.update({ userId }, { isDefault: false });
    Object.assign(address, dto);
    return this.repo.save(address);
  }

  async remove(userId: string, id: string) {
    const address = await this.repo.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Địa chỉ không tồn tại');
    await this.repo.remove(address);
    return { message: 'Đã xóa địa chỉ' };
  }

  async setDefault(userId: string, id: string) {
    const address = await this.repo.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Địa chỉ không tồn tại');
    await this.repo.update({ userId }, { isDefault: false });
    address.isDefault = true;
    return this.repo.save(address);
  }
}
