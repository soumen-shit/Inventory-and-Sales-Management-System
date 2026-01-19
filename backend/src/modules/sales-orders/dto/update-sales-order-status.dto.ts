import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum SalesOrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class UpdateSalesOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(SalesOrderStatus)
  status: SalesOrderStatus;
}
