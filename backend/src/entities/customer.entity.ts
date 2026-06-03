import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  @Column({ nullable: true })
  email: string | null;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column()
  phone: string;

  @Column({ name: 'order_count', default: 0 })
  orderCount: number;

  @Column({ name: 'total_spent', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ name: 'last_order_at', type: 'timestamptz', nullable: true })
  lastOrderAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
