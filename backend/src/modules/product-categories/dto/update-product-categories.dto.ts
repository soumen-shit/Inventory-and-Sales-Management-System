import { PartialType } from '@nestjs/mapped-types';
import { ProductCategoryDto } from './create-product-categories.dto';

export class UpdateCategoryDto extends PartialType(ProductCategoryDto) {}
