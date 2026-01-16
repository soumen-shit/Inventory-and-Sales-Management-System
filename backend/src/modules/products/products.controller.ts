import { Body, Controller, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.CreateProductDto(createProductDto);
  }
}
