import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SalesOrder } from 'src/database/entities/sales-order.entity';
import { SalesOrderItem } from 'src/database/entities/sales-order-item.entity';
import { Customer } from 'src/database/entities/customer.entity';
import { ProductVariant } from 'src/database/entities/product-variant.entity';
import { Inventory } from 'src/database/entities/inventory.entity';
import { Batch } from 'src/database/entities/batch.entity';
import { InventoryMovement } from 'src/database/entities/inventory-movement.entity';
import { InventoryReferenceType } from 'src/enums/inventory-ref-type.enum';
import { Repository, DataSource } from 'typeorm';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { CreateSalesOrderItemDto } from './dto/create-sales-order-item.dto';

@Injectable()
export class SalesOrdersService {
  constructor(
    @InjectRepository(SalesOrder)
    private salesOrderRepo: Repository<SalesOrder>,
    @InjectRepository(SalesOrderItem)
    private salesOrderItemRepo: Repository<SalesOrderItem>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(ProductVariant)
    private productVariantRepo: Repository<ProductVariant>,
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
    @InjectRepository(Batch)
    private batchRepo: Repository<Batch>,
    @InjectRepository(InventoryMovement)
    private inventoryMovementRepo: Repository<InventoryMovement>,
    private dataSource: DataSource,
  ) {}

  async createSalesOrder(
    createSalesOrderDto: CreateSalesOrderDto,
    userId: string,
  ) {
    const customer = await this.customerRepo.findOne({
      where: { id: createSalesOrderDto.customer_id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const salesOrder = this.salesOrderRepo.create({
      status: 'PENDING',
      total_amount: 0,
      created_by: userId,
      customer,
    });

    return this.salesOrderRepo.save(salesOrder);
  }

  async addSalesOrderItem(
    soId: string,
    createSalesOrderItemDto: CreateSalesOrderItemDto,
  ) {
    const salesOrder = await this.salesOrderRepo.findOne({
      where: { id: soId },
    });

    if (!salesOrder) {
      throw new NotFoundException('Sales order not found');
    }

    // return salesOrder;

    if (salesOrder.status === 'DELIVERED') {
      throw new BadRequestException(
        'Cannot add items to a delivered sales order',
      );
    }

    if (salesOrder.status === 'CANCELLED') {
      throw new BadRequestException(
        'Cannot add items to a cancelled sales order',
      );
    }

    const productVariant = await this.productVariantRepo.findOne({
      where: { id: createSalesOrderItemDto.product_variant_id },
      relations: ['inventory'],
    });

    // return productVariant;

    if (!productVariant) {
      throw new NotFoundException('Product variant not found');
    }

    // Check stock availability
    if (!productVariant.inventory) {
      throw new BadRequestException('Product variant has no inventory');
    }

    const availableStock = productVariant.inventory.quantity;

    if (availableStock < createSalesOrderItemDto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${availableStock}, Requested: ${createSalesOrderItemDto.quantity}`,
      );
    }

    const totalPrice =
      createSalesOrderItemDto.quantity *
      Number(createSalesOrderItemDto.unit_price);

    const salesOrderItem = this.salesOrderItemRepo.create({
      quantity: createSalesOrderItemDto.quantity,
      unit_price: createSalesOrderItemDto.unit_price,
      total_price: totalPrice,
      variant: productVariant,
      salesOrder,
    });

    await this.salesOrderItemRepo.save(salesOrderItem);

    // Recalculate total amount
    const items = await this.salesOrderItemRepo.find({
      where: { salesOrder: { id: soId } },
    });

    salesOrder.total_amount = items.reduce(
      (sum, item) => sum + Number(item.total_price),
      0,
    );

    await this.salesOrderRepo.save(salesOrder);

    return salesOrderItem;
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

    const queryBuilder = this.salesOrderRepo.createQueryBuilder('salesOrder');

    queryBuilder.leftJoinAndSelect('salesOrder.customer', 'customer');
    queryBuilder.leftJoinAndSelect('salesOrder.orderItems', 'orderItems');

    if (query?.customer_id) {
      queryBuilder.where('salesOrder.customer = :customerId', {
        customerId: query.customer_id,
      });
    }

    if (query?.status) {
      queryBuilder.andWhere('salesOrder.status = :status', {
        status: query.status,
      });
    }

    if (query?.from_date) {
      queryBuilder.andWhere('salesOrder.order_date >= :fromDate', {
        fromDate: query.from_date,
      });
    }

    if (query?.to_date) {
      queryBuilder.andWhere('salesOrder.order_date <= :toDate', {
        toDate: query.to_date,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('salesOrder.created_at', 'DESC')
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
    const salesOrder = await this.salesOrderRepo.findOne({
      where: { id },
      relations: [
        'customer',
        'orderItems',
        'orderItems.variant',
        'orderItems.variant.product',
      ],
    });

    if (!salesOrder) {
      throw new NotFoundException('Sales order not found');
    }

    return salesOrder;
  }

  async updateStatus(id: string, status: string) {
    const salesOrder = await this.salesOrderRepo.findOne({
      where: { id },
      relations: [
        'orderItems',
        'orderItems.variant',
        'orderItems.variant.inventory',
      ],
    });

    if (!salesOrder) {
      throw new NotFoundException('Sales order not found');
    }

    if (salesOrder.status === 'CANCELLED') {
      throw new BadRequestException(
        'Cannot change status of a cancelled sales order',
      );
    }

    if (status !== 'DELIVERED') {
      salesOrder.status = status;
      await this.salesOrderRepo.save(salesOrder);
      return this.findOne(id);
    }

    if (salesOrder.status === 'DELIVERED') {
      throw new BadRequestException('Sales order already delivered');
    }

    if (salesOrder.orderItems.length === 0) {
      throw new BadRequestException('Cannot deliver sales order without items');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of salesOrder.orderItems) {
        const variant = item.variant;
        let remainingQty = item.quantity;

        const batches = await queryRunner.manager.find(Batch, {
          where: { variant: { id: variant.id } },
          order: { created_at: 'ASC' }, // FIFO
        });

        let totalDeducted = 0;

        for (const batch of batches) {
          if (remainingQty <= 0) break;

          const deductQty = Math.min(remainingQty, batch.quantity);

          if (deductQty > 0) {
            const movement = this.inventoryMovementRepo.create({
              movement_type: InventoryReferenceType.SALES_ORDER,
              quantity: deductQty,
              reference_type: 'SALES_ORDER',
              reference_id: salesOrder.id,
              remarks: `Sales delivered | Batch ${batch.batch_number}`,
              batch,
              variant,
            });

            await queryRunner.manager.save(movement);

            batch.quantity -= deductQty;
            await queryRunner.manager.save(batch);

            remainingQty -= deductQty;
            totalDeducted += deductQty;
          }
        }

        if (remainingQty > 0) {
          throw new BadRequestException(
            `Insufficient stock for variant ${variant.variant_name}`,
          );
        }

        const inventory = await queryRunner.manager.findOne(Inventory, {
          where: { variant: { id: variant.id } },
        });

        if (!inventory || inventory.quantity < totalDeducted) {
          throw new BadRequestException(
            `Inventory mismatch for ${variant.variant_name}`,
          );
        }

        inventory.quantity -= totalDeducted;
        await queryRunner.manager.save(inventory);
      }

      salesOrder.status = 'DELIVERED';
      await queryRunner.manager.save(salesOrder);

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        `Failed to process sales order: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
