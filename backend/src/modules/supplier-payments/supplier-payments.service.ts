/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SupplierPayment } from 'src/database/entities/supplier-payment.entity';
import { Supplier } from 'src/database/entities/supplier.entity';
import { PurchaseOrder } from 'src/database/entities/purchase-order.entity';
import { SupplierPaymentStatus } from 'src/enums/supplier-payment-status.enum';
import { Repository } from 'typeorm';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';

@Injectable()
export class SupplierPaymentsService {
  constructor(
    @InjectRepository(SupplierPayment)
    private supplierPaymentRepo: Repository<SupplierPayment>,
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepo: Repository<PurchaseOrder>,
  ) {}

  async createSupplierPayment(
    createSupplierPaymentDto: CreateSupplierPaymentDto,
  ) {
    const supplier = await this.supplierRepo.findOne({
      where: { id: createSupplierPaymentDto.supplier_id },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    let purchaseOrder: PurchaseOrder | null = null;

    if (createSupplierPaymentDto.purchase_order_id) {
      purchaseOrder = await this.purchaseOrderRepo.findOne({
        where: { id: createSupplierPaymentDto.purchase_order_id },
      });

      if (!purchaseOrder) {
        throw new NotFoundException('Purchase order not found');
      }

      if (purchaseOrder.supplier.id !== supplier.id) {
        throw new BadRequestException(
          'Purchase order does not belong to this supplier',
        );
      }
    }

    const payment = this.supplierPaymentRepo.create({
      payment_date: new Date(createSupplierPaymentDto.payment_date),
      amount: createSupplierPaymentDto.amount,
      payment_method_id: createSupplierPaymentDto.payment_method_id || undefined,
      reference_number: createSupplierPaymentDto.reference_number,
      status: createSupplierPaymentDto.status as SupplierPaymentStatus,
      supplier,
      purchaseOrder: purchaseOrder || undefined,
    });

    return this.supplierPaymentRepo.save(payment);
  }

  async findAll(query?: {
    page?: number;
    limit?: number;
    supplier_id?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.supplierPaymentRepo.createQueryBuilder('payment');

    queryBuilder.leftJoinAndSelect('payment.supplier', 'supplier');
    queryBuilder.leftJoinAndSelect('payment.purchaseOrder', 'purchaseOrder');

    if (query?.supplier_id) {
      queryBuilder.where('payment.supplier = :supplierId', {
        supplierId: query.supplier_id,
      });
    }

    if (query?.status) {
      queryBuilder.andWhere('payment.status = :status', {
        status: query.status,
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

  async findByPurchaseOrder(poId: string) {
    const purchaseOrder = await this.purchaseOrderRepo.findOne({
      where: { id: poId },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    return this.supplierPaymentRepo.find({
      where: { purchaseOrder: { id: poId } },
      relations: ['supplier'],
      order: { created_at: 'DESC' },
    });
  }

  async findBySupplier(supplierId: string) {
    const supplier = await this.supplierRepo.findOne({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return this.supplierPaymentRepo.find({
      where: { supplier: { id: supplierId } },
      relations: ['purchaseOrder'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const payment = await this.supplierPaymentRepo.findOne({
      where: { id },
      relations: ['supplier', 'purchaseOrder'],
    });

    if (!payment) {
      throw new NotFoundException('Supplier payment not found');
    }

    return payment;
  }

  async updateStatus(id: string, status: string) {
    const payment = await this.supplierPaymentRepo.findOne({ where: { id } });

    if (!payment) {
      throw new NotFoundException('Supplier payment not found');
    }

    payment.status = status as any;
    return this.supplierPaymentRepo.save(payment);
  }
}
