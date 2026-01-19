import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Return } from './return.entity';

@Entity({ name: 'refunds' })
export class Refund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', name: 'refund_date' })
  refund_date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'uuid', name: 'payment_method_id', nullable: true })
  payment_method_id: string | null;

  @Column({ type: 'varchar', length: 120, name: 'reference_number' })
  reference_number: string;

  @Column({ type: 'varchar', length: 20, name: 'status' })
  status: string;

  @OneToOne(() => Return, (returnOrder) => returnOrder.refund)
  @JoinColumn({ name: 'return_id' })
  returnOrder: Return;
}
