import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from 'src/database/entities/supplier.entity';
import { SupplierPayment } from 'src/database/entities/supplier-payment.entity';
import { SupplierPaymentsModule } from '../supplier-payments/supplier-payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supplier, SupplierPayment]),
    SupplierPaymentsModule,
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}
