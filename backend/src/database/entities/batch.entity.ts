import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { InventoryMovement } from './inventory-movement.entity';

@Entity({ name: 'batches' })
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, name: 'batch_number' })
  batch_number: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({
    type: 'date',
    nullable: true,
    name: 'expiry_date',
  })
  expiry_date: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => ProductVariant, (variant) => variant.batchs)
  @JoinColumn({ name: 'product_variant_id' })
  variant: ProductVariant;

  @OneToMany(
    () => InventoryMovement,
    (inventoryMovement) => inventoryMovement.batch,
  )
  inventoryMovements: InventoryMovement;
}
