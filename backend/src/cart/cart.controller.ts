import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsInt, IsUUID, Min } from 'class-validator';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities';

class AddCartDto {
  @IsUUID()
  product_id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

class UpdateCartDto {
  @IsInt()
  @Min(0)
  quantity: number;
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private service: CartService) {}

  @Get()
  getCart(@CurrentUser() user: User) {
    return this.service.getCart(user.id);
  }

  @Post('items')
  addItem(@CurrentUser() user: User, @Body() dto: AddCartDto) {
    return this.service.addItem(user.id, dto.product_id, dto.quantity);
  }

  @Patch('items/:product_id')
  updateItem(
    @CurrentUser() user: User,
    @Param('product_id') productId: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.service.updateQuantity(user.id, productId, dto.quantity);
  }

  @Delete('items/:product_id')
  removeItem(@CurrentUser() user: User, @Param('product_id') productId: string) {
    return this.service.removeItem(user.id, productId);
  }

  @Delete()
  clear(@CurrentUser() user: User) {
    return this.service.clear(user.id);
  }
}
