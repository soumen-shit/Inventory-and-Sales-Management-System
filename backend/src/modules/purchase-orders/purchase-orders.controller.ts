/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { CreatePurchaseOrderItemDto } from './dto/create-puchase-order-item.dto';
import { UpdatePurchaseOrderStatusDto } from './dto/update-purchase-order-status.dto';
import { JwtAuthGuird } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { SupplierPaymentsService } from '../supplier-payments/supplier-payments.service';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuird, RolesGuard)
export class PurchaseOrdersController {
  constructor(
    private readonly purchaseOrdersService: PurchaseOrdersService,
    private readonly supplierPaymentsService: SupplierPaymentsService,
  ) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  createPurchaseOrder(
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto,
    @Req() req: any,
  ) {
    return this.purchaseOrdersService.createPurchaseOrder(
      createPurchaseOrderDto,
      req.user.userId,
    );
  }

  @Post(':id/items')
  @Roles('ADMIN', 'MANAGER')
  addPurchaseOrderItem(
    @Param('id') id: string,
    @Body() createPurchaseOrderItemDto: CreatePurchaseOrderItemDto,
  ) {
    return this.purchaseOrdersService.addProductOrderItem(
      id,
      createPurchaseOrderItemDto,
    );
  }

  @Get()
  @Roles('ADMIN', 'MANAGER')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('supplier_id') supplier_id?: string,
  ) {
    return this.purchaseOrdersService.findAllPurchaseOrder({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      status,
      supplier_id,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER')
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Get(':poId/payments')
  @Roles('ADMIN', 'MANAGER')
  getPaymentsByPurchaseOrder(@Param('poId') poId: string) {
    return this.supplierPaymentsService.findByPurchaseOrder(poId);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'MANAGER')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdatePurchaseOrderStatusDto,
  ) {
    return this.purchaseOrdersService.updateStatus(id, updateStatusDto.status);
  }
}
