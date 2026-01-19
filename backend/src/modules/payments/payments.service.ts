import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from 'src/database/entities/payment.entity';
import { Invoice } from 'src/database/entities/invoice.entity';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: createPaymentDto.invoice_id },
      relations: ['payments'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Calculate total paid amount
    const totalPaid = invoice.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    const remainingAmount = Number(invoice.total_amount) - totalPaid;

    if (Number(createPaymentDto.amount) > remainingAmount) {
      throw new BadRequestException(
        `Payment amount exceeds remaining balance. Remaining: ${remainingAmount}`,
      );
    }

    const payment = this.paymentRepo.create({
      payment_date: new Date(createPaymentDto.payment_date),
      amount: createPaymentDto.amount,
      payment_method_id: createPaymentDto.payment_method_id || null,
      reference_number: createPaymentDto.reference_number,
      status: createPaymentDto.status,
      invoice,
    });

    const savedPayment = await this.paymentRepo.save(payment);

    // Update invoice status if fully paid
    const newTotalPaid = totalPaid + Number(createPaymentDto.amount);
    if (newTotalPaid >= Number(invoice.total_amount)) {
      invoice.status = 'PAID';
      await this.invoiceRepo.save(invoice);
    } else if (newTotalPaid > 0) {
      invoice.status = 'PARTIAL';
      await this.invoiceRepo.save(invoice);
    }

    return savedPayment;
  }

  async findAll(query?: {
    page?: number;
    limit?: number;
    invoice_id?: string;
    from_date?: string;
    to_date?: string;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.paymentRepo.createQueryBuilder('payment');

    queryBuilder.leftJoinAndSelect('payment.invoice', 'invoice');
    queryBuilder.leftJoinAndSelect('invoice.salesOrder', 'salesOrder');

    if (query?.invoice_id) {
      queryBuilder.where('payment.invoice = :invoiceId', {
        invoiceId: query.invoice_id,
      });
    }

    if (query?.from_date) {
      queryBuilder.andWhere('payment.payment_date >= :fromDate', {
        fromDate: query.from_date,
      });
    }

    if (query?.to_date) {
      queryBuilder.andWhere('payment.payment_date <= :toDate', {
        toDate: query.to_date,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('payment.created_at', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByInvoice(invoiceId: string) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: ['payments'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const payments = await this.paymentRepo.find({
      where: { invoice: { id: invoiceId } },
      order: { created_at: 'DESC' },
    });

    const totalPaid = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    return {
      invoice: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        total_amount: invoice.total_amount,
        status: invoice.status,
      },
      payments,
      totalPaid,
      remaining: Number(invoice.total_amount) - totalPaid,
    };
  }

  async findOne(id: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['invoice', 'invoice.salesOrder'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async updateStatus(id: string, status: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['invoice'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = status;
    return this.paymentRepo.save(payment);
  }
}
