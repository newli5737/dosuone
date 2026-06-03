import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private service: WishlistService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.service.findAll(user.id);
  }

  @Post(':product_id')
  add(@CurrentUser() user: User, @Param('product_id') productId: string) {
    return this.service.add(user.id, productId);
  }

  @Delete(':product_id')
  remove(@CurrentUser() user: User, @Param('product_id') productId: string) {
    return this.service.remove(user.id, productId);
  }
}
