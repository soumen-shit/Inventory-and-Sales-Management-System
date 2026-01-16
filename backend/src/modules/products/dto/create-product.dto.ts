import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  sku: string;

  @IsString()
  category_id: string;

  @IsOptional()
  @IsNumber()
  reorder_level: number;

  @IsOptional()
  @IsBoolean()
  is_active: boolean;
}
