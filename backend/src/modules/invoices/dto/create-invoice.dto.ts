import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  sales_order_id: string;

  @IsDateString()
  @IsNotEmpty()
  due_date: string;
}
