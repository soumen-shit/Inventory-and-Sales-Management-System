import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuird } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { PaymentsService } from '../payments/payments.service';

@Controller('invoices')
@UseGuards(JwtAuthGuird, RolesGuard)
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.createInvoice(createInvoiceDto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('from_date') from_date?: string,
    @Query('to_date') to_date?: string,
  ) {
    return this.invoicesService.findAll({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      status,
      from_date,
      to_date,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Get(':id/pdf')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  generatePDF(@Param('id') id: string) {
    return this.invoicesService.generatePDF(id);
  }

  @Get(':invoiceId/payments')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  getPaymentsByInvoice(@Param('invoiceId') invoiceId: string) {
    return this.paymentsService.findByInvoice(invoiceId);
  }
}
