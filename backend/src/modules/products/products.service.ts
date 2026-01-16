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

    console.log('category', category);

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

    console.log('product', product);

    return product;
  }
}
