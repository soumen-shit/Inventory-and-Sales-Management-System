import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PurchaseOrderItem } from './purchase-order-item.entity';
import { Supplier } from './supplier.entity';
import { SupplierPayment } from './supplier-payment.entity';

@Entity({ name: 'purchase_orders' })
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'order_date' })
  order_date: Date;

  @Column({ type: 'varchar', length: 20, name: 'status' })
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_amount: number;

  @Column({ type: 'uuid', name: 'created_by' })
  created_by: string;

  @OneToMany(() => PurchaseOrderItem, (orderItem) => orderItem.purchaseOrder)
  orderItems: PurchaseOrderItem[];

  @ManyToOne(() => Supplier, (supplier) => supplier.purchaseOrders)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToMany(() => SupplierPayment, (payment) => payment.purchaseOrder)
  supplierPayments: SupplierPayment[];
}
