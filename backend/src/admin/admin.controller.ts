import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { IsBoolean } from 'class-validator';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities';

class UserStatusDto {
  @IsBoolean()
  is_active: boolean;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private service: AdminService) {}

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

  @Get('users')
  listUsers(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.listUsers(page, limit);
  }

  @Patch('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body() dto: UserStatusDto) {
    return this.service.updateUserStatus(id, dto.is_active);
  }
}
