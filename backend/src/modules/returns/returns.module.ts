import { Module } from '@nestjs/common';
import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Return } from 'src/database/entities/return.entity';
import { SalesOrder } from 'src/database/entities/sales-order.entity';
import { ProductVariant } from 'src/database/entities/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Return, SalesOrder, ProductVariant]),
  ],
  controllers: [ReturnsController],
  providers: [ReturnsService],
})
export class ReturnsModule {}
