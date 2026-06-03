import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities';

class AddressDto {
  @IsString()
  full_name: string;

  @IsString()
  phone: string;

  @IsString()
  province: string;

  @IsString()
  district: string;

  @IsString()
  ward: string;

  @IsString()
  address_detail: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private service: AddressesService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.service.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: AddressDto) {
    return this.service.create(user.id, {
      fullName: dto.full_name,
      phone: dto.phone,
      province: dto.province,
      district: dto.district,
      ward: dto.ward,
      addressDetail: dto.address_detail,
      isDefault: dto.is_default,
    });
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: AddressDto) {
    return this.service.update(user.id, id, {
      fullName: dto.full_name,
      phone: dto.phone,
      province: dto.province,
      district: dto.district,
      ward: dto.ward,
      addressDetail: dto.address_detail,
      isDefault: dto.is_default,
    });
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.remove(user.id, id);
  }

  @Patch(':id/default')
  setDefault(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.setDefault(user.id, id);
  }
}
