import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductCategoriesModule } from './modules/product-categories/product-categories.module';
import { ProductsModule } from './modules/products/products.module';
import { ProductVariantsModule } from './modules/product-variants/product-variants.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { SupplierPaymentsModule } from './modules/supplier-payments/supplier-payments.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SalesOrdersModule } from './modules/sales-orders/sales-orders.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { RefundsModule } from './modules/refunds/refunds.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),
    AuthModule,
    UsersModule,
    ProductCategoriesModule,
    ProductsModule,
    ProductVariantsModule,
    InventoryModule,
    SuppliersModule,
    PurchaseOrdersModule,
    SupplierPaymentsModule,
    CustomersModule,
    SalesOrdersModule,
    InvoicesModule,
    PaymentsModule,
    ReturnsModule,
    RefundsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
