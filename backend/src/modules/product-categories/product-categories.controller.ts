import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { ProductCategoryDto } from './dto/create-product-categories.dto';

@Controller('product-categories')
export class ProductCategoriesController {
  constructor(
    private readonly productCategoryService: ProductCategoriesService,
  ) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  createCategory(@Body() productCategoryDto: ProductCategoryDto) {
    return this.productCategoryService.createCategory(productCategoryDto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGET', 'STUFF')
  findAllCategories() {
    return this.productCategoryService.findAllCategories();
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGET', 'STUFF')
  findCategoryById(@Param('id') id: string) {
    return this.productCategoryService.findCategoryById(id);
  }
}
