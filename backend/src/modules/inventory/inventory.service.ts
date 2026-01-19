import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from 'src/database/entities/inventory.entity';
import { ProductVariant } from 'src/database/entities/product-variant.entity';
import { Product } from 'src/database/entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    @InjectRepository(ProductVariant)
    private variantRepo: Repository<ProductVariant>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async findAllInventory() {
    const invetories = await this.inventoryRepo.find({
      relations: ['variant', 'variant.product'],
    });

    return invetories;
  }

  async findInventoryByVariantId(variantId: string) {
    const inventory = await this.inventoryRepo.findOne({
      where: {
        variant: {
          id: variantId,
        },
      },
      relations: ['variant'],
    });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    return inventory;
  }

  async findLowStock() {
    const inventories = await this.inventoryRepo.find({
      relations: ['variant', 'variant.product'],
    });

    return inventories.filter(
      (inv) => inv.quantity < inv.variant.product.reorder_level,
    );
  }
}
