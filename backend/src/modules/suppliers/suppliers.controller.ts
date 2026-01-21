import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuird } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { SuppliersService } from './suppliers.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { SupplierPaymentsService } from '../supplier-payments/supplier-payments.service';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@UseGuards(JwtAuthGuird, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(
    private readonly supplierService: SuppliersService,
    private readonly supplierPaymentsService: SupplierPaymentsService,
  ) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  async createSupplier(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.createSupplier(createSupplierDto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  async findAllSupplier() {
    return this.supplierService.findAllSupplier();
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  async findSupplierById(@Param('id') id: string) {
    return this.supplierService.findSupplierById(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  async updateSupplier(
    @Param('id')
    id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.supplierService.updateSupplier(id, updateSupplierDto);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  async changeStatus(
    @Param('id') id: string,
    @Body() body: { is_active: boolean },
  ) {
    return this.supplierService.changeStatus(id, body.is_active);
  }

  @Get(':supplierId/payments')
  @Roles('ADMIN', 'MANAGER')
  async getSupplierPayments(@Param('supplierId') supplierId: string) {
    return this.supplierPaymentsService.findBySupplier(supplierId);
  }
}
