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
import { ProductVariantsService } from './product-variants.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { JwtAuthGuird } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { UpdateVariantDto } from './dto/updat-variant.dto';

@Controller('product-variants')
@UseGuards(JwtAuthGuird, RolesGuard)
export class ProductVariantsController {
  constructor(private readonly productVariantService: ProductVariantsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  async createProductVariant(@Body() createVariantDto: CreateVariantDto) {
    return this.productVariantService.createVariant(createVariantDto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  async findAllVariant(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
  ) {
    return this.productVariantService.findAllVariant({
      page: +page || 1,
      limit: +limit || 10,
      search: search,
    });
  }

  @Get(':productId/variants')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  async findSingleProductAndThereVariant(
    @Param('productId') productId: string,
  ) {
    return this.productVariantService.findSingleProductAndThereVariant(
      productId,
    );
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  async updateVariant(
    @Param('id') id: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    return this.productVariantService.updateVariant(id, updateVariantDto);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  async changeVariantStatus(
    @Param('id') id: string,
    updateVariantDto: UpdateVariantDto,
  ) {
    return this.productVariantService.changeVariantStatus(id, updateVariantDto);
  }
}
