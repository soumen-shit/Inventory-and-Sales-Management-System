import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from 'src/database/entities/invoice.entity';
import { SalesOrder } from 'src/database/entities/sales-order.entity';
import { Repository } from 'typeorm';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(SalesOrder)
    private salesOrderRepo: Repository<SalesOrder>,
  ) {}

  async createInvoice(createInvoiceDto: CreateInvoiceDto) {
    const salesOrder = await this.salesOrderRepo.findOne({
      where: { id: createInvoiceDto.sales_order_id },
      relations: ['orderItems'],
    });

    if (!salesOrder) {
      throw new NotFoundException('Sales order not found');
    }

    // Check if invoice already exists for this sales order
    const existingInvoice = await this.invoiceRepo.findOne({
      where: { salesOrder: { id: createInvoiceDto.sales_order_id } },
    });

    if (existingInvoice) {
      throw new BadRequestException(
        'Invoice already exists for this sales order',
      );
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const invoice = this.invoiceRepo.create({
      invoice_number: invoiceNumber,
      invoice_date: new Date(),
      total_amount: salesOrder.total_amount,
      status: 'PENDING',
      salesOrder,
    });

    return this.invoiceRepo.save(invoice);
  }

  async findAll(query?: {
    page?: number;
    limit?: number;
    status?: string;
    from_date?: string;
    to_date?: string;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.invoiceRepo.createQueryBuilder('invoice');

    queryBuilder.leftJoinAndSelect('invoice.salesOrder', 'salesOrder');
    queryBuilder.leftJoinAndSelect('salesOrder.customer', 'customer');

    if (query?.status) {
      queryBuilder.where('invoice.status = :status', {
        status: query.status,
      });
    }

    if (query?.from_date) {
      queryBuilder.andWhere('invoice.invoice_date >= :fromDate', {
        fromDate: query.from_date,
      });
    }

    if (query?.to_date) {
      queryBuilder.andWhere('invoice.invoice_date <= :toDate', {
        toDate: query.to_date,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('invoice.created_at', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
      relations: [
        'salesOrder',
        'salesOrder.customer',
        'salesOrder.orderItems',
        'salesOrder.orderItems.variant',
        'payments',
      ],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async generatePDF(id: string) {
    const invoice = await this.findOne(id);

    // For now, return invoice data. PDF generation can be implemented later
    return {
      message: 'PDF generation not implemented yet',
      invoice,
    };
  }
}
