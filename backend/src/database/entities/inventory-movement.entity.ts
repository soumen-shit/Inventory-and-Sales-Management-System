import { InventoryReferenceType } from '../../enums/inventory-ref-type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Batch } from './batch.entity';
import { ProductVariant } from './product-variant.entity';

@Entity({ name: 'inventory_movements' })
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: InventoryReferenceType, name: 'movement_type' })
  movement_type: InventoryReferenceType;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'varchar', length: 50, name: 'reference_type' })
  reference_type: string;

  @Column({ type: 'uuid', name: 'reference_id' })
  reference_id: string;

  @Column({ type: 'text' })
  remarks: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Batch, (batch) => batch.inventoryMovements)
  @JoinColumn({ name: 'batch_id' })
  batch: Batch;

  @ManyToOne(() => ProductVariant, (varient) => varient.inventoryMovements)
  @JoinColumn({ name: 'product_variant_id' })
  variant: ProductVariant;
}
