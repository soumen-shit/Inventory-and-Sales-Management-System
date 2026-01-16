import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategory } from 'src/database/entities/product-category.entity';
import { IsNull, Repository } from 'typeorm';
import { ProductCategoryDto } from './dto/create-product-categories.dto';
import { UpdateCategoryDto } from './dto/update-product-categories.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private categoryRepo: Repository<ProductCategory>,
  ) {}
  async createCategory(productCategoryDto: ProductCategoryDto) {
    let parent: ProductCategory | undefined;

    if (productCategoryDto.parent_id) {
      const foundParent = await this.categoryRepo.findOne({
        where: {
          id: productCategoryDto.parent_id,
        },
      });

      if (!foundParent) {
        throw new NotFoundException('Parent category not found');
      }
      parent = foundParent;
    }

    const category = this.categoryRepo.create({
      name: productCategoryDto.name,
      description: productCategoryDto.description,
      parent,
    });

    return this.categoryRepo.save(category);
  }

  async findAllCategories() {
    return this.categoryRepo.find({
      where: { parent: IsNull(), is_active: true },
      relations: ['children', 'children.children'],
      order: {
        created_at: 'ASC',
      },
    });
  }

  async findCategoryById(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!category) {
      throw new NotFoundException('category not found');
    }

    return category;
  }

  async updateCategoryOrParent(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.name) {
      category.name = updateCategoryDto.name;
    }

    if (updateCategoryDto.description) {
      category.description = updateCategoryDto.description;
    }

    if (typeof updateCategoryDto.is_active === 'boolean') {
      category.is_active = false;
    }

    if (updateCategoryDto.parent_id) {
      if (updateCategoryDto.parent_id === id) {
        throw new ForbiddenException('Category cannot be its own parent');
      }
      const parent = await this.categoryRepo.findOne({
        where: {
          id: updateCategoryDto.parent_id,
        },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
      category.parent = parent;
    }

    return this.categoryRepo.save(category);
  }
}
