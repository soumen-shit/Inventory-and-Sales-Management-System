import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePurchaseOrderDto {
  @IsUUID()
  @IsNotEmpty()
  supplier_id: string;
}
