/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
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
      due_date: new Date(createInvoiceDto.due_date),
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

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = new PassThrough();

    doc.pipe(stream);

    /* ======================
     HEADER
  ====================== */
    doc.fontSize(22).text('INVOICE', { align: 'center' }).moveDown(1.5);

    doc
      .fontSize(10)
      .text(`Invoice No: ${invoice.invoice_number}`)
      .text(`Invoice Date: ${new Date(invoice.invoice_date).toDateString()}`)
      .text(`Due Date: ${new Date(invoice.due_date).toDateString()}`)
      .text(`Status: ${invoice.status}`)
      .moveDown(1.5);

    /* ======================
     CUSTOMER DETAILS
  ====================== */
    doc.fontSize(12).text('Bill To:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(invoice.salesOrder.customer.name);
    doc.text(invoice.salesOrder.customer.email);
    doc.text(invoice.salesOrder.customer.phone);
    doc.moveDown(1.5);

    /* ======================
     TABLE HEADER
  ====================== */
    const startY = doc.y;

    const colItem = 50;
    const colQty = 300;
    const colPrice = 370;
    const colTotal = 460;

    doc
      .fontSize(10)
      .text('Item', colItem, startY)
      .text('Qty', colQty, startY)
      .text('Unit Price', colPrice, startY)
      .text('Total', colTotal, startY);

    doc
      .moveTo(50, startY + 15)
      .lineTo(550, startY + 15)
      .stroke();

    /* ======================
     ITEMS
  ====================== */
    let y = startY + 25;

    invoice.salesOrder.orderItems.forEach((item) => {
      doc.text(item.variant.variant_name, colItem, y, { width: 230 });
      doc.text(item.quantity.toString(), colQty, y);
      doc.text(`₹${Number(item.unit_price).toFixed(2)}`, colPrice, y);
      doc.text(`₹${Number(item.total_price).toFixed(2)}`, colTotal, y);
      y += 22;
    });

    /* ======================
     TOTAL
  ====================== */
    doc.moveDown(2);
    doc.moveTo(350, y).lineTo(550, y).stroke();

    doc
      .fontSize(12)
      .text(
        `Grand Total: ₹${Number(invoice.total_amount).toFixed(2)}`,
        350,
        y + 10,
        { align: 'right' },
      );

    /* ======================
     FOOTER
  ====================== */
    doc.moveDown(3);
    doc.fontSize(9).text('Thank you for your business!', {
      align: 'center',
    });

    doc.end();
    return stream;
  }

  async updateStatus(id: string, status: string) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Cannot change status of a PAID invoice');
    }

    if (invoice.status === status) {
      throw new BadRequestException(`Invoice is already ${status}`);
    }

    invoice.status = status;
    return this.invoiceRepo.save(invoice);
  }
}
