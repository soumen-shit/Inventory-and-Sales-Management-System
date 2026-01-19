import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductVariant } from 'src/database/entities/product-variant.entity';
import { Product } from 'src/database/entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/updat-variant.dto';
import { Inventory } from 'src/database/entities/inventory.entity';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantRepo: Repository<ProductVariant>,
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    private readonly dataSource: DataSource,
  ) {}

  async createVariant(createVariantDto: CreateVariantDto) {
    return this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id: createVariantDto.product_id, is_active: true },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const isSkuExists = await manager.findOne(ProductVariant, {
        where: { sku: createVariantDto.sku },
      });

      if (isSkuExists) {
        throw new ConflictException('Variant SKU already exists');
      }

      const variant = manager.create(ProductVariant, {
        variant_name: createVariantDto.variant_name,
        sku: createVariantDto.sku,
        price: createVariantDto.price,
        product,
      });

      const savedVariant = await manager.save(variant);
      const inventory = manager.create(Inventory, {
        quantity: 0,
        variant: savedVariant,
      });

      await manager.save(inventory);

      savedVariant.inventory = inventory;
      return savedVariant;
    });
  }

  async findAllVariant(query: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search;

    const qb = this.variantRepo
      .createQueryBuilder('variant')
      .leftJoinAndSelect('variant.product', 'product')
      .where('variant.is_active = :isActive', { isActive: true });

    //Search
    if (search) {
      qb.andWhere(
        `(variant.variant_name ILIKE :search
            OR variant.sku ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    //pagination
    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('variant.created_at', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findSingleProductAndThereVariant(productId: string) {
    const product = await this.productRepo.findOne({
      where: {
        id: productId,
      },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async updateVariant(id: string, updateVariantDto: UpdateVariantDto) {
    const prodVariants = await this.variantRepo.findOne({
      where: { id },
    });
    if (!prodVariants) {
      throw new NotFoundException('Product variant not found');
    }

    const isSkuExists = await this.variantRepo.findOne({
      where: { sku: updateVariantDto.sku },
    });

    if (isSkuExists) {
      throw new ConflictException('Variant SKU already exists');
    }

    if (updateVariantDto.variant_name) {
      prodVariants.variant_name = updateVariantDto.variant_name;
    }
    if (updateVariantDto.sku) {
      prodVariants.sku = updateVariantDto.sku;
    }

    if (updateVariantDto.price != undefined) {
      prodVariants.price = updateVariantDto.price;
    }

    return this.variantRepo.save(prodVariants);
  }

  async changeVariantStatus(id: string, updateVariantDto: UpdateVariantDto) {
    const prodVariant = await this.variantRepo.findOne({
      where: { id },
    });

    if (!prodVariant) {
      throw new NotFoundException('Product variant not found');
    }

    if (typeof updateVariantDto.is_active == 'boolean') {
      prodVariant.is_active = updateVariantDto.is_active;
    }

    return await this.variantRepo.save(prodVariant);
  }
}
