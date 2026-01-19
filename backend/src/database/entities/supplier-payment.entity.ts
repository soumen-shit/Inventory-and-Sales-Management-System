import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Supplier } from './supplier.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { SupplierPaymentStatus } from 'src/enums/supplier-payment-status.enum';

@Entity({ name: 'supplier_payments' })
export class SupplierPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', name: 'payment_date' })
  payment_date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'uuid', name: 'payment_method_id', nullable: true })
  payment_method_id: string | null;

  @Column({ type: 'varchar', length: 100, name: 'reference_number' })
  reference_number: string;

  @Column({
    type: 'enum',
    enum: SupplierPaymentStatus,
  })
  status: SupplierPaymentStatus;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Supplier, (supplier) => supplier.supplierPayments)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ManyToOne(() => PurchaseOrder, { nullable: true })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;
}
