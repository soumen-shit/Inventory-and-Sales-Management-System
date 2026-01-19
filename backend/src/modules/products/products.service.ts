import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategory } from 'src/database/entities/product-category.entity';
import { Product } from 'src/database/entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(ProductCategory)
    private productCategoryRepo: Repository<ProductCategory>,
  ) {}

  async CreateProductDto(createProductDto: CreateProductDto) {
    const category = await this.productCategoryRepo.findOne({
      where: { id: createProductDto.category_id, is_active: true },
      relations: ['children', 'children.children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.children?.length > 0) {
      throw new BadRequestException(
        'Product can only be added to leaf category',
      );
    }

    const product = this.productRepo.create({
      name: createProductDto.name,
      sku: createProductDto.sku,
      reorder_level: createProductDto.reorder_level || 0,
      category,
    });

    await this.productRepo.save(product);

    return product;
  }

  async findAllProduct(query: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search;
    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.is_active = :isActive', { isActive: true });

    //Search
    if (search) {
      qb.andWhere(
        `(product.name ILIKE :search
            OR product.sku ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    //pagination
    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('product.created_at', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findProductById(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepo.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.name) {
      product.name = updateProductDto.name;
    }
    if (updateProductDto.sku) {
      product.sku = updateProductDto.sku;
    }
    if (updateProductDto.reorder_level !== undefined) {
      product.reorder_level = updateProductDto.reorder_level;
    }

    await this.productRepo.save(product);
    return product;
  }

  async changeStatus(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.is_active = !product.is_active;
    await this.productCategoryRepo.save(product);
    return product;
  }
}
