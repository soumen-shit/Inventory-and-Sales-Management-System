import { Module } from '@nestjs/common';
import { SalesOrdersController } from './sales-orders.controller';
import { SalesOrdersService } from './sales-orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesOrder } from 'src/database/entities/sales-order.entity';
import { SalesOrderItem } from 'src/database/entities/sales-order-item.entity';
import { Customer } from 'src/database/entities/customer.entity';
import { ProductVariant } from 'src/database/entities/product-variant.entity';
import { Inventory } from 'src/database/entities/inventory.entity';
import { Batch } from 'src/database/entities/batch.entity';
import { InventoryMovement } from 'src/database/entities/inventory-movement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalesOrder,
      SalesOrderItem,
      Customer,
      ProductVariant,
      Inventory,
      Batch,
      InventoryMovement,
    ]),
  ],
  controllers: [SalesOrdersController],
  providers: [SalesOrdersService],
})
export class SalesOrdersModule {}
