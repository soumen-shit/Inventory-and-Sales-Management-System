import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Refund } from 'src/database/entities/refund.entity';
import { Return } from 'src/database/entities/return.entity';
import { Inventory } from 'src/database/entities/inventory.entity';
import { Batch } from 'src/database/entities/batch.entity';
import { InventoryMovement } from 'src/database/entities/inventory-movement.entity';
import { InventoryReferenceType } from 'src/enums/inventory-ref-type.enum';
import { Repository, DataSource } from 'typeorm';
import { CreateRefundDto } from './dto/create-refund.dto';

@Injectable()
export class RefundsService {
  constructor(
    @InjectRepository(Refund)
    private refundRepo: Repository<Refund>,
    @InjectRepository(Return)
    private returnRepo: Repository<Return>,
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
    @InjectRepository(Batch)
    private batchRepo: Repository<Batch>,
    @InjectRepository(InventoryMovement)
    private inventoryMovementRepo: Repository<InventoryMovement>,
    private dataSource: DataSource,
  ) {}

  async createRefund(createRefundDto: CreateRefundDto) {
    const returnOrder = await this.returnRepo.findOne({
      where: { id: createRefundDto.return_id },
      relations: ['salesOrder', 'variant', 'refund'],
    });

    if (!returnOrder) {
      throw new NotFoundException('Return not found');
    }

    if (returnOrder.status !== 'APPROVED') {
      throw new BadRequestException(
        'Refund can only be created for approved returns',
      );
    }

    // Check if refund already exists
    if (returnOrder.refund) {
      throw new ConflictException('Refund already exists for this return');
    }

    // Create refund
    const refund = this.refundRepo.create({
      refund_date: new Date(createRefundDto.refund_date),
      amount: createRefundDto.amount,
      payment_method_id: createRefundDto.payment_method_id || undefined,
      reference_number: createRefundDto.reference_number,
      status: createRefundDto.status,
      returnOrder,
    });

    const savedRefund = await this.refundRepo.save(refund);

    // Restock inventory when refund is created (if status is SUCCESS)
    if (createRefundDto.status === 'SUCCESS') {
      await this.restockInventory(returnOrder);
    }

    return savedRefund;
  }

  private async restockInventory(returnOrder: Return) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const variant = returnOrder.variant;

      // Create a new batch or add to existing batch
      const batchNumber = `RETURN-${variant.sku}-${Date.now()}`;
      const batch = this.batchRepo.create({
        batch_number: batchNumber,
        quantity: returnOrder.quantity,
        expiry_date: null,
        variant: variant,
      });

      const savedBatch = await queryRunner.manager.save(batch);

      // Create inventory movement (IN)
      const inventoryMovement = this.inventoryMovementRepo.create({
        movement_type: InventoryReferenceType.ADJUSTMENT,
        quantity: returnOrder.quantity,
        reference_type: 'RETURN',
        reference_id: returnOrder.id,
        remarks: `Return restocked - Batch: ${batchNumber}`,
        batch: savedBatch,
        variant: variant,
      });

      await queryRunner.manager.save(inventoryMovement);

      // Update inventory
      let inventory = await queryRunner.manager.findOne(Inventory, {
        where: { variant: { id: variant.id } },
        relations: ['variant'],
      });

      if (!inventory) {
        inventory = this.inventoryRepo.create({
          quantity: returnOrder.quantity,
          variant: variant,
        });
      } else {
        inventory.quantity += returnOrder.quantity;
      }

      await queryRunner.manager.save(inventory);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

    const queryBuilder = this.refundRepo.createQueryBuilder('refund');

    queryBuilder.leftJoinAndSelect('refund.returnOrder', 'returnOrder');
    queryBuilder.leftJoinAndSelect('returnOrder.salesOrder', 'salesOrder');
    queryBuilder.leftJoinAndSelect('salesOrder.customer', 'customer');

    if (query?.status) {
      queryBuilder.where('refund.status = :status', {
        status: query.status,
      });
    }

    if (query?.from_date) {
      queryBuilder.andWhere('refund.refund_date >= :fromDate', {
        fromDate: query.from_date,
      });
    }

    if (query?.to_date) {
      queryBuilder.andWhere('refund.refund_date <= :toDate', {
        toDate: query.to_date,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('refund.refund_date', 'DESC')
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
    const refund = await this.refundRepo.findOne({
      where: { id },
      relations: [
        'returnOrder',
        'returnOrder.salesOrder',
        'returnOrder.variant',
        'returnOrder.salesOrder.customer',
      ],
    });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    return refund;
  }

  async updateStatus(id: string, status: string) {
    const refund = await this.refundRepo.findOne({
      where: { id },
      relations: ['returnOrder'],
    });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    const oldStatus = refund.status;
    refund.status = status;

    // If status changes to SUCCESS, restock inventory
    if (oldStatus !== 'SUCCESS' && status === 'SUCCESS') {
      await this.restockInventory(refund.returnOrder);
    }

    return this.refundRepo.save(refund);
  }
}
