import { Controller, Get } from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';

@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private service: BankAccountsService) {}

  /** STK mặc định cho màn thanh toán (không cần đăng nhập). */
  @Get('checkout')
  checkout() {
    return this.service.getCheckoutPreview();
  }
}
