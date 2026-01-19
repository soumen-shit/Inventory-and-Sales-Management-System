import { IsNotEmpty, IsString, IsInt, IsUUID } from 'class-validator';

export class CreateReturnDto {
  @IsUUID()
  @IsNotEmpty()
  sales_order_id: string;

  @IsUUID()
  @IsNotEmpty()
  product_variant_id: string;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
