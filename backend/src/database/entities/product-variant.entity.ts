import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Inventory } from './inventory.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';
import { Batch } from './batch.entity';
import { InventoryMovement } from './inventory-movement.entity';
import { SalesOrderItem } from './sales-order-item.entity';
import { Return } from './return.entity';

@Entity({ name: 'product_variant' })
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 155 })
  variant_name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToOne(() => Inventory, (inventory) => inventory.variant)
  inventory: Inventory;

  @OneToMany(() => PurchaseOrderItem, (orderIem) => orderIem.variant)
  orderItem: PurchaseOrderItem[];

  @OneToMany(() => Batch, (batch) => batch.variant)
  batchs: Batch[];

  @OneToMany(
    () => InventoryMovement,
    (inventoryMovement) => inventoryMovement.variant,
  )
  inventoryMovements: InventoryMovement[];

  @OneToMany(() => SalesOrderItem, (orderItem) => orderItem.variant)
  salesOrderItems: SalesOrderItem[];

  @OneToMany(() => Return, (returnOrder) => returnOrder.variant)
  returns: Return[];
}
