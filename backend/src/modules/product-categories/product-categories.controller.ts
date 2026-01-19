import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { ProductCategoryDto } from './dto/create-product-categories.dto';
import { JwtAuthGuird } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateCategoryDto } from './dto/update-product-categories.dto';

@Controller('product-categories')
@UseGuards(JwtAuthGuird, RolesGuard)
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
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  findAllCategories() {
    return this.productCategoryService.findAllCategories();
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  findCategoryById(@Param('id') id: string) {
    return this.productCategoryService.findCategoryById(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.productCategoryService.updateCategory(id, updateCategoryDto);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  changeStatus(@Param('id') id: string) {
    return this.productCategoryService.changeStatus(id);
  }
}
