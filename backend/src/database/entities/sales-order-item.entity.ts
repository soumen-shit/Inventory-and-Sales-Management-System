import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SalesOrder } from './sales-order.entity';
import { ProductVariant } from './product-variant.entity';

@Entity({ name: 'sales_order_items' })
export class SalesOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price' })
  unit_price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_price' })
  total_price: number;

  @ManyToOne(() => SalesOrder, (salesOrder) => salesOrder.orderItems)
  @JoinColumn({ name: 'sales_order_id' })
  salesOrder: SalesOrder;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'product_variant_id' })
  variant: ProductVariant;
}
