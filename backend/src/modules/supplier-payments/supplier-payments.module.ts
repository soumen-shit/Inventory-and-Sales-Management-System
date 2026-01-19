import { Module } from '@nestjs/common';
import { SupplierPaymentsController } from './supplier-payments.controller';
import { SupplierPaymentsService } from './supplier-payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierPayment } from 'src/database/entities/supplier-payment.entity';
import { Supplier } from 'src/database/entities/supplier.entity';
import { PurchaseOrder } from 'src/database/entities/purchase-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupplierPayment, Supplier, PurchaseOrder]),
  ],
  controllers: [SupplierPaymentsController],
  providers: [SupplierPaymentsService],
  exports: [SupplierPaymentsService],
})
export class SupplierPaymentsModule {}
