import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum RefundStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export class UpdateRefundStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(RefundStatus)
  status: RefundStatus;
}
