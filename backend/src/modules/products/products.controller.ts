import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuird } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateCategoryDto } from '../product-categories/dto/update-product-categories.dto';

@UseGuards(JwtAuthGuird, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.CreateProductDto(createProductDto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  findAllProducts(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
  ) {
    return this.productService.findAllProduct({
      page: +page || 1,
      limit: +limit || 10,
      search,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  findProductById(@Param('id') id: string) {
    return this.productService.findProductById(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  updateProduuct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateCategoryDto,
  ) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  changeStatus(@Param('id') id: string) {
    return this.productService.changeStatus(id);
  }
}
