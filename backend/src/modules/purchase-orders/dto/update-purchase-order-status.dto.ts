import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum PurchaseOrderStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export class UpdatePurchaseOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(PurchaseOrderStatus)
  status: PurchaseOrderStatus;
}
