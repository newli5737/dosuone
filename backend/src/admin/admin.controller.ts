import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsArray, IsBoolean, IsString } from 'class-validator';
import { BankAccountsService } from '../bank-accounts/bank-accounts.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateBankAccountDto, UpdateBankAccountDto } from '../bank-accounts/dto/bank-account.dto';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities';

class UserStatusDto {
  @IsBoolean()
  is_active: boolean;
}

class DeleteCloudinaryDto {
  @IsArray()
  @IsString({ each: true })
  public_ids: string[];
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private service: AdminService,
    private bankAccounts: BankAccountsService,
    private cloudinary: CloudinaryService,
  ) {}

  @Get('upload/config')
  uploadConfig() {
    return this.cloudinary.getPublicConfig();
  }

  @Post('cloudinary/delete')
  deleteCloudinary(@Body() dto: DeleteCloudinaryDto) {
    return this.cloudinary.destroyMany(dto.public_ids);
  }

  @Get('stats/overview')
  overview() {
    return this.service.overview();
  }

  @Get('stats/revenue')
  revenue(@Query('period') period?: string) {
    return this.service.revenue(period);
  }

  @Get('stats/top-products')
  topProducts() {
    return this.service.topProducts();
  }

  @Get('stats/low-stock')
  lowStock(@Query('limit') limit?: number) {
    return this.service.lowStock(limit);
  }

  @Get('users')
  listUsers(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.listUsers(page, limit);
  }

  @Patch('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body() dto: UserStatusDto) {
    return this.service.updateUserStatus(id, dto.is_active);
  }

  @Get('bank-accounts')
  listBankAccounts() {
    return this.bankAccounts.findAllAdmin();
  }

  @Post('bank-accounts')
  createBankAccount(@Body() dto: CreateBankAccountDto) {
    return this.bankAccounts.create(dto);
  }

  @Patch('bank-accounts/:id')
  updateBankAccount(@Param('id') id: string, @Body() dto: UpdateBankAccountDto) {
    return this.bankAccounts.update(id, dto);
  }

  @Delete('bank-accounts/:id')
  removeBankAccount(@Param('id') id: string) {
    return this.bankAccounts.remove(id);
  }
}
