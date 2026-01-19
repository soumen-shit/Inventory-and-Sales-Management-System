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

  async createSalesOrder(createSalesOrderDto: CreateSalesOrderDto, userId: string) {
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
      relations: ['orderItems'],
    });

    if (!salesOrder) {
      throw new NotFoundException('Sales order not found');
    }

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
      relations: ['orderItems', 'orderItems.variant', 'orderItems.variant.inventory'],
    });

    if (!salesOrder) {
      throw new NotFoundException('Sales order not found');
    }

    if (salesOrder.status === 'CANCELLED' && status !== 'CANCELLED') {
      throw new BadRequestException(
        'Cannot change status of a cancelled sales order',
      );
    }

    if (status === 'DELIVERED') {
      if (salesOrder.status === 'DELIVERED') {
        throw new BadRequestException('Sales order already delivered');
      }

      if (salesOrder.orderItems.length === 0) {
        throw new BadRequestException(
          'Cannot deliver sales order without items',
        );
      }

      // Use transaction for data consistency
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Process each item in the sales order (FIFO batch deduction)
        for (const item of salesOrder.orderItems) {
          const variant = item.variant;
          let remainingQuantity = item.quantity;

          // Get batches for this variant sorted by created_at (FIFO)
          const batches = await queryRunner.manager.find(Batch, {
            where: { variant: { id: variant.id } },
            order: { created_at: 'ASC' },
          });

          let totalDeducted = 0;

          // Deduct from batches using FIFO
          for (const batch of batches) {
            if (remainingQuantity <= 0) break;

            const deductAmount = Math.min(remainingQuantity, batch.quantity);

            if (deductAmount > 0) {
              // Create inventory movement (OUT)
              const inventoryMovement = this.inventoryMovementRepo.create({
                movement_type: InventoryReferenceType.SALES_ORDER,
                quantity: -deductAmount,
                reference_type: 'SALES_ORDER',
                reference_id: salesOrder.id,
                remarks: `Sales order delivered - Deducted from batch: ${batch.batch_number}`,
                batch: batch,
                variant: variant,
              });

              await queryRunner.manager.save(inventoryMovement);

              // Update batch quantity
              batch.quantity -= deductAmount;
              if (batch.quantity === 0) {
                await queryRunner.manager.remove(batch);
              } else {
                await queryRunner.manager.save(batch);
              }

              totalDeducted += deductAmount;
              remainingQuantity -= deductAmount;
            }
          }

          if (remainingQuantity > 0) {
            throw new BadRequestException(
              `Insufficient stock for variant ${variant.variant_name}. Remaining: ${remainingQuantity}`,
            );
          }

          // Update inventory quantity
          let inventory = await queryRunner.manager.findOne(Inventory, {
            where: { variant: { id: variant.id } },
            relations: ['variant'],
          });

          if (inventory) {
            inventory.quantity -= totalDeducted;
            await queryRunner.manager.save(inventory);
          }
        }

        // Update sales order status
        salesOrder.status = 'DELIVERED';
        await queryRunner.manager.save(salesOrder);

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new BadRequestException(
          `Failed to process sales order: ${errorMessage}`,
        );
      } finally {
        await queryRunner.release();
      }
    } else {
      salesOrder.status = status;
      await this.salesOrderRepo.save(salesOrder);
    }

    return this.findOne(id);
  }
}
