import { IsInt, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreatePurchaseOrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  product_variant_id: string;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unit_price: number;
}
