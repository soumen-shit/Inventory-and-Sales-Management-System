import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { SalesOrderItem } from './sales-order-item.entity';
import { Invoice } from './invoice.entity';
import { Return } from './return.entity';

@Entity({ name: 'sales_orders' })
export class SalesOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'date', name: 'order_date' })
  order_date: Date;

  @Column({ type: 'varchar', length: 20, name: 'status' })
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_amount' })
  total_amount: number;

  @Column({ type: 'uuid', name: 'created_by' })
  created_by: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => Customer, (customer) => customer.salesOrders)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => SalesOrderItem, (orderItem) => orderItem.salesOrder)
  orderItems: SalesOrderItem[];

  @OneToOne(() => Invoice, (invoice) => invoice.salesOrder)
  invoice: Invoice;

  @OneToMany(() => Return, (returnOrder) => returnOrder.salesOrder)
  returns: Return[];
}
