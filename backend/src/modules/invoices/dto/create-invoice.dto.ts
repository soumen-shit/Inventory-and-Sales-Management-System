import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  sales_order_id: string;
}
