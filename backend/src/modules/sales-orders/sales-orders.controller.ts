/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { CreateSalesOrderItemDto } from './dto/create-sales-order-item.dto';
import { UpdateSalesOrderStatusDto } from './dto/update-sales-order-status.dto';
import { JwtAuthGuird } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';

@Controller('sales-orders')
@UseGuards(JwtAuthGuird, RolesGuard)
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  createSalesOrder(
    @Body() createSalesOrderDto: CreateSalesOrderDto,
    @Req() req: any,
  ) {
    return this.salesOrdersService.createSalesOrder(
      createSalesOrderDto,
      req.user.userId,
    );
  }

  @Post(':id/items')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  addSalesOrderItem(
    @Param('id') id: string,
    @Body() createSalesOrderItemDto: CreateSalesOrderItemDto,
  ) {
    return this.salesOrdersService.addSalesOrderItem(
      id,
      createSalesOrderItemDto,
    );
  }

  @Get()
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('customer_id') customer_id?: string,
    @Query('status') status?: string,
    @Query('from_date') from_date?: string,
    @Query('to_date') to_date?: string,
  ) {
    return this.salesOrdersService.findAll({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      customer_id,
      status,
      from_date,
      to_date,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  findOne(@Param('id') id: string) {
    return this.salesOrdersService.findOne(id);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'MANAGER')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateSalesOrderStatusDto,
  ) {
    return this.salesOrdersService.updateStatus(id, updateStatusDto.status);
  }
}
