import { Module } from '@nestjs/common';
import { RefundsController } from './refunds.controller';
import { RefundsService } from './refunds.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Refund } from 'src/database/entities/refund.entity';
import { Return } from 'src/database/entities/return.entity';
import { Inventory } from 'src/database/entities/inventory.entity';
import { Batch } from 'src/database/entities/batch.entity';
import { InventoryMovement } from 'src/database/entities/inventory-movement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Refund,
      Return,
      Inventory,
      Batch,
      InventoryMovement,
    ]),
  ],
  controllers: [RefundsController],
  providers: [RefundsService],
})
export class RefundsModule {}
