import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../entities/bank-account.entity';
import { PaymentMethod } from '../entities/enums';
import { buildSepayQrUrl, buildTransferDescription } from '../common/utils/sepay-qr.util';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dto/bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccount) private repo: Repository<BankAccount>,
  ) {}

  async findAllAdmin() {
    return this.repo.find({ order: { isDefault: 'DESC', sortOrder: 'ASC', createdAt: 'DESC' } });
  }

  async getDefaultActive(): Promise<BankAccount | null> {
    const def = await this.repo.findOne({ where: { isActive: true, isDefault: true } });
    if (def) return def;
    return this.repo.findOne({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async getCheckoutPreview() {
    const acc = await this.getDefaultActive();
    if (!acc) return null;
    return this.toPublic(acc);
  }

  buildPaymentInfo(account: BankAccount, orderCode: string, amount: number) {
    const transferContent = buildTransferDescription(orderCode);
    const qrUrl = buildSepayQrUrl({
      acc: account.accountNumber,
      bank: account.bankCode,
      amount,
      des: transferContent,
      template: 'compact',
      download: false,
    });
    return {
      bank_name: account.bankName,
      bank_code: account.bankCode,
      account_number: account.accountNumber,
      account_holder: account.accountHolder,
      amount: Math.round(amount),
      transfer_content: transferContent,
      qr_url: qrUrl,
    };
  }

  async buildForOrder(paymentMethod: PaymentMethod, orderCode: string, amount: number) {
    if (paymentMethod !== PaymentMethod.BANK_TRANSFER) return null;
    const acc = await this.getDefaultActive();
    if (!acc) {
      throw new BadRequestException('Chưa cấu hình tài khoản ngân hàng nhận tiền');
    }
    return this.buildPaymentInfo(acc, orderCode, amount);
  }

  async buildForOrderOptional(paymentMethod: PaymentMethod, orderCode: string, amount: number) {
    if (paymentMethod !== PaymentMethod.BANK_TRANSFER) return null;
    const acc = await this.getDefaultActive();
    if (!acc) return null;
    return this.buildPaymentInfo(acc, orderCode, amount);
  }

  async create(dto: CreateBankAccountDto) {
    if (dto.is_default) {
      await this.repo.update({ isDefault: true }, { isDefault: false });
    }
    const row = this.repo.create({
      bankName: dto.bank_name,
      bankCode: dto.bank_code.toUpperCase(),
      accountNumber: dto.account_number,
      accountHolder: dto.account_holder,
      isActive: dto.is_active ?? true,
      isDefault: dto.is_default ?? false,
      sortOrder: dto.sort_order ?? 0,
    });
    return this.repo.save(row);
  }

  async update(id: string, dto: UpdateBankAccountDto) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Tài khoản không tồn tại');
    if (dto.is_default) {
      await this.repo.update({ isDefault: true }, { isDefault: false });
    }
    Object.assign(row, {
      ...(dto.bank_name != null && { bankName: dto.bank_name }),
      ...(dto.bank_code != null && { bankCode: dto.bank_code.toUpperCase() }),
      ...(dto.account_number != null && { accountNumber: dto.account_number }),
      ...(dto.account_holder != null && { accountHolder: dto.account_holder }),
      ...(dto.is_active != null && { isActive: dto.is_active }),
      ...(dto.is_default != null && { isDefault: dto.is_default }),
      ...(dto.sort_order != null && { sortOrder: dto.sort_order }),
    });
    return this.repo.save(row);
  }

  async remove(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Tài khoản không tồn tại');
    await this.repo.remove(row);
    return { deleted: true };
  }

  private toPublic(acc: BankAccount) {
    return {
      id: acc.id,
      bank_name: acc.bankName,
      bank_code: acc.bankCode,
      account_number: acc.accountNumber,
      account_holder: acc.accountHolder,
      is_default: acc.isDefault,
    };
  }
}
