import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { ProductVariant } from './product-variant.entity';

@Entity({ name: 'purchase_order_items' })
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_price: number;

  @ManyToOne(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.orderItems)
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @ManyToOne(() => ProductVariant, (variant) => variant.orderItem)
  @JoinColumn({ name: 'product_variant_id' })
  variant: ProductVariant;
}
