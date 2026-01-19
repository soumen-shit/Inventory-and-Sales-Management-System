import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSalesOrderDto {
  @IsUUID()
  @IsNotEmpty()
  customer_id: string;
}
