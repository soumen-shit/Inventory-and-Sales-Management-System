import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SupplierPaymentsService } from './supplier-payments.service';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';
import { UpdateSupplierPaymentStatusDto } from './dto/update-supplier-payment-status.dto';
import { JwtAuthGuird } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';

@Controller('supplier-payments')
@UseGuards(JwtAuthGuird, RolesGuard)
export class SupplierPaymentsController {
  constructor(
    private readonly supplierPaymentsService: SupplierPaymentsService,
  ) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  createSupplierPayment(@Body() createDto: CreateSupplierPaymentDto) {
    return this.supplierPaymentsService.createSupplierPayment(createDto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('supplier_id') supplier_id?: string,
    @Query('status') status?: string,
    @Query('from_date') from_date?: string,
    @Query('to_date') to_date?: string,
  ) {
    return this.supplierPaymentsService.findAll({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      supplier_id,
      status,
      from_date,
      to_date,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER')
  findOne(@Param('id') id: string) {
    return this.supplierPaymentsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateSupplierPaymentStatusDto,
  ) {
    return this.supplierPaymentsService.updateStatus(id, updateDto.status);
  }
}
