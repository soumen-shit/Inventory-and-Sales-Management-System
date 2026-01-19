import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SalesOrder } from './sales-order.entity';
import { ProductVariant } from './product-variant.entity';
import { Refund } from './refund.entity';

@Entity({ name: 'returns' })
export class Return {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'varchar', length: 20, name: 'status' })
  status: string;

  @Column({ type: 'date', name: 'return_date' })
  return_date: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => SalesOrder, (salesOrder) => salesOrder.returns)
  @JoinColumn({ name: 'sales_order_id' })
  salesOrder: SalesOrder;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'product_variant_id' })
  variant: ProductVariant;

  @OneToOne(() => Refund, (refund) => refund.returnOrder)
  refund: Refund;
}
