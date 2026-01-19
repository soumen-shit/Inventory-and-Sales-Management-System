import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Batch } from 'src/database/entities/batch.entity';
import { PurchaseOrderItem } from 'src/database/entities/purchase-order-item.entity';
import { PurchaseOrder } from 'src/database/entities/purchase-order.entity';
import { Supplier } from 'src/database/entities/supplier.entity';
import { Repository, DataSource } from 'typeorm';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ProductVariant } from 'src/database/entities/product-variant.entity';
import { CreatePurchaseOrderItemDto } from './dto/create-puchase-order-item.dto';
import { Inventory } from 'src/database/entities/inventory.entity';
import { InventoryMovement } from 'src/database/entities/inventory-movement.entity';
import { InventoryReferenceType } from 'src/enums/inventory-ref-type.enum';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepo: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemRepo: Repository<PurchaseOrderItem>,
    @InjectRepository(Batch) private batchRepo: Repository<Batch>,
    @InjectRepository(Supplier) private supplierRepo: Repository<Supplier>,
    @InjectRepository(ProductVariant)
    private productVariantRepo: Repository<ProductVariant>,
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
    @InjectRepository(InventoryMovement)
    private inventoryMovementRepo: Repository<InventoryMovement>,
    private dataSource: DataSource,
  ) {}

  async createPurchaseOrder(
    createPurchaseOrderDto: CreatePurchaseOrderDto,
    userId: string,
  ) {
    const supplier = await this.supplierRepo.findOne({
      where: { id: createPurchaseOrderDto.supplier_id },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const purchaseOrder = this.purchaseOrderRepo.create({
      status: 'PENDING',
      total_amount: 0,
      created_by: userId,
      supplier,
    });

    return this.purchaseOrderRepo.save(purchaseOrder);
  }

  async addProductOrderItem(
    poId: string,
    createPurchaseOrderItemDto: CreatePurchaseOrderItemDto,
  ) {
    const po = await this.purchaseOrderRepo.findOne({
      where: { id: poId },
      relations: ['orderItem'],
    });

    if (!po) {
      throw new NotFoundException('Purchase order not found');
    }

    if (po.status === 'RECEIVED') {
      throw new BadRequestException(
        'Cannot add items to a received purchase order',
      );
    }

    if (po.status === 'CANCELLED') {
      throw new BadRequestException(
        'Cannot add items to a cancelled purchase order',
      );
    }

    const productVariant = await this.productVariantRepo.findOne({
      where: { id: createPurchaseOrderItemDto.product_variant_id },
    });

    if (!productVariant) {
      throw new NotFoundException('Product variant not found');
    }

    const totalPrice =
      createPurchaseOrderItemDto.quantity *
      Number(createPurchaseOrderItemDto.unit_price);

    const purchaseOrderItem = this.purchaseOrderItemRepo.create({
      quantity: createPurchaseOrderItemDto.quantity,
      unit_price: createPurchaseOrderItemDto.unit_price,
      total_price: totalPrice,
      variant: productVariant,
      purchaseOrder: po,
    });

    await this.purchaseOrderItemRepo.save(purchaseOrderItem);

    // Recalculate total amount
    const items = await this.purchaseOrderItemRepo.find({
      where: { purchaseOrder: { id: poId } },
    });

    po.total_amount = items.reduce(
      (sum, item) => sum + Number(item.total_price),
      0,
    );

    await this.purchaseOrderRepo.save(po);

    return purchaseOrderItem;
  }

  async findAllPurchaseOrder(query?: {
    page?: number;
    limit?: number;
    status?: string;
    supplier_id?: string;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const where: {
      status?: string;
      supplier?: { id: string };
    } = {};

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.supplier_id) {
      where.supplier = { id: query.supplier_id };
    }

    const [data, total] = await this.purchaseOrderRepo.findAndCount({
      where,
      relations: ['supplier', 'orderItem', 'orderItem.variant'],
      skip,
      take: limit,
      order: { order_date: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const purchaseOrder = await this.purchaseOrderRepo.findOne({
      where: { id },
      relations: [
        'supplier',
        'orderItem',
        'orderItem.variant',
        'orderItem.variant.product',
      ],
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    return purchaseOrder;
  }

  async updateStatus(id: string, status: string) {
    const purchaseOrder = await this.purchaseOrderRepo.findOne({
      where: { id },
      relations: ['orderItem', 'orderItem.variant'],
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    if (purchaseOrder.status === 'RECEIVED' && status !== 'RECEIVED') {
      throw new BadRequestException(
        'Cannot change status of a received purchase order',
      );
    }

    if (purchaseOrder.status === 'CANCELLED') {
      throw new BadRequestException(
        'Cannot change status of a cancelled purchase order',
      );
    }

    if (status === 'RECEIVED') {
      if (purchaseOrder.orderItem.length === 0) {
        throw new BadRequestException(
          'Cannot receive purchase order without items',
        );
      }

      // Use transaction for data consistency
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Process each item in the purchase order
        for (const item of purchaseOrder.orderItem) {
          const variant = item.variant;

          // Generate batch number
          const batchNumber = `BATCH-${variant.sku}-${Date.now()}`;

          // Create batch
          const batch = this.batchRepo.create({
            batch_number: batchNumber,
            quantity: item.quantity,
            expiry_date: null, // Can be added later if needed
            variant: variant,
          });

          const savedBatch = await queryRunner.manager.save(batch);

          // Create inventory movement (IN)
          const inventoryMovement = this.inventoryMovementRepo.create({
            movement_type: InventoryReferenceType.PURCHASE_ORDER,
            quantity: item.quantity,
            reference_type: 'PURCHASE_ORDER',
            reference_id: purchaseOrder.id,
            remarks: `Purchase order received - Batch: ${batchNumber}`,
            batch: savedBatch,
            variant: variant,
          });

          await queryRunner.manager.save(inventoryMovement);

          // Update or create inventory
          let inventory = await queryRunner.manager.findOne(Inventory, {
            where: { variant: { id: variant.id } },
            relations: ['variant'],
          });

          if (!inventory) {
            inventory = this.inventoryRepo.create({
              quantity: item.quantity,
              variant: variant,
            });
          } else {
            inventory.quantity += item.quantity;
          }

          await queryRunner.manager.save(inventory);
        }

        // Update purchase order status
        purchaseOrder.status = 'RECEIVED';
        await queryRunner.manager.save(purchaseOrder);

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new BadRequestException(
          `Failed to process purchase order: ${errorMessage}`,
        );
      } finally {
        await queryRunner.release();
      }
    } else {
      purchaseOrder.status = status;
      await this.purchaseOrderRepo.save(purchaseOrder);
    }

    return this.findOne(id);
  }
}
