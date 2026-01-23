import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SalesOrder } from './sales-order.entity';
import { Payment } from './payment.entity';

@Entity({ name: 'invoices' })
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'invoice_number',
    unique: true,
  })
  invoice_number: string;

  @Column({ type: 'date', name: 'invoice_date' })
  invoice_date: Date;

  @Column({ type: Date, name: 'due_date' })
  due_date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_amount' })
  total_amount: number;

  @Column({ type: 'varchar', length: 20, name: 'status' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @OneToOne(() => SalesOrder, (salesOrder) => salesOrder.invoice)
  @JoinColumn({ name: 'sales_order_id' })
  salesOrder: SalesOrder;

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments: Payment[];
}
