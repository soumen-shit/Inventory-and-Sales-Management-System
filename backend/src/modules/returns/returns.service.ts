import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Return } from 'src/database/entities/return.entity';
import { SalesOrder } from 'src/database/entities/sales-order.entity';
import { ProductVariant } from 'src/database/entities/product-variant.entity';
import { Repository } from 'typeorm';
import { CreateReturnDto } from './dto/create-return.dto';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(Return)
    private returnRepo: Repository<Return>,
    @InjectRepository(SalesOrder)
    private salesOrderRepo: Repository<SalesOrder>,
    @InjectRepository(ProductVariant)
    private productVariantRepo: Repository<ProductVariant>,
  ) {}

  async createReturn(createReturnDto: CreateReturnDto) {
    const salesOrder = await this.salesOrderRepo.findOne({
      where: { id: createReturnDto.sales_order_id },
      relations: ['orderItems', 'orderItems.variant'],
    });

    if (!salesOrder) {
      throw new NotFoundException('Sales order not found');
    }

    if (salesOrder.status !== 'DELIVERED') {
      throw new BadRequestException(
        'Returns can only be created for delivered orders',
      );
    }

    const productVariant = await this.productVariantRepo.findOne({
      where: { id: createReturnDto.product_variant_id },
    });

    if (!productVariant) {
      throw new NotFoundException('Product variant not found');
    }

    // Verify item exists in sales order
    const orderItem = salesOrder.orderItems.find(
      (item) => item.variant.id === createReturnDto.product_variant_id,
    );

    if (!orderItem) {
      throw new BadRequestException(
        'Product variant not found in sales order',
      );
    }

    // Check if return quantity exceeds ordered quantity
    const existingReturns = await this.returnRepo.find({
      where: {
        salesOrder: { id: createReturnDto.sales_order_id },
        variant: { id: createReturnDto.product_variant_id },
        status: 'APPROVED',
      },
    });

    const totalReturned = existingReturns.reduce(
      (sum, ret) => sum + ret.quantity,
      0,
    );

    if (totalReturned + createReturnDto.quantity > orderItem.quantity) {
      throw new BadRequestException(
        `Return quantity exceeds ordered quantity. Ordered: ${orderItem.quantity}, Already returned: ${totalReturned}`,
      );
    }

    const returnOrder = this.returnRepo.create({
      quantity: createReturnDto.quantity,
      reason: createReturnDto.reason,
      status: 'REQUESTED',
      return_date: new Date(),
      salesOrder,
      variant: productVariant,
    });

    return this.returnRepo.save(returnOrder);
  }

  async findAll(query?: {
    page?: number;
    limit?: number;
    customer_id?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.returnRepo.createQueryBuilder('returnOrder');

    queryBuilder.leftJoinAndSelect('returnOrder.salesOrder', 'salesOrder');
    queryBuilder.leftJoinAndSelect('salesOrder.customer', 'customer');
    queryBuilder.leftJoinAndSelect('returnOrder.variant', 'variant');

    if (query?.customer_id) {
      queryBuilder.where('salesOrder.customer = :customerId', {
        customerId: query.customer_id,
      });
    }

    if (query?.status) {
      queryBuilder.andWhere('returnOrder.status = :status', {
        status: query.status,
      });
    }

    if (query?.from_date) {
      queryBuilder.andWhere('returnOrder.return_date >= :fromDate', {
        fromDate: query.from_date,
      });
    }

    if (query?.to_date) {
      queryBuilder.andWhere('returnOrder.return_date <= :toDate', {
        toDate: query.to_date,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('returnOrder.created_at', 'DESC')
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
    const returnOrder = await this.returnRepo.findOne({
      where: { id },
      relations: [
        'salesOrder',
        'salesOrder.customer',
        'variant',
        'refund',
      ],
    });

    if (!returnOrder) {
      throw new NotFoundException('Return not found');
    }

    return returnOrder;
  }

  async updateStatus(id: string, status: string) {
    const returnOrder = await this.returnRepo.findOne({
      where: { id },
      relations: ['salesOrder'],
    });

    if (!returnOrder) {
      throw new NotFoundException('Return not found');
    }

    if (returnOrder.status === 'APPROVED' && status !== 'APPROVED') {
      throw new BadRequestException(
        'Cannot change status of an approved return',
      );
    }

    returnOrder.status = status;
    return this.returnRepo.save(returnOrder);
  }
}
