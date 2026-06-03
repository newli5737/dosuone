import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bank_name' })
  bankName: string;

  /** Mã ngân hàng Sepay (VD: Vietcombank → VCB) */
  @Column({ name: 'bank_code' })
  bankCode: string;

  @Column({ name: 'account_number' })
  accountNumber: string;

  @Column({ name: 'account_holder' })
  accountHolder: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
