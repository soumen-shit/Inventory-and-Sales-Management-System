import { Module } from '@nestjs/common';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { User } from 'src/database/entities/user.entity';
import { PurchaseOrderItem } from 'src/database/entities/purchase-order-item.entity';
import { PurchaseOrder } from 'src/database/entities/purchase-order.entity';
import { Supplier } from 'src/database/entities/supplier.entity';
import { Inventory } from 'src/database/entities/inventory.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Batch } from 'src/database/entities/batch.entity';
import { InventoryMovement } from 'src/database/entities/inventory-movement.entity';
import { ProductVariant } from 'src/database/entities/product-variant.entity';
import { SupplierPaymentsModule } from '../supplier-payments/supplier-payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      PurchaseOrderItem,
      PurchaseOrder,
      Supplier,
      Inventory,
      Batch,
      InventoryMovement,
      ProductVariant,
    ]),
    SupplierPaymentsModule,
  ],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
