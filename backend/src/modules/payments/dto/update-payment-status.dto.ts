import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export class UpdatePaymentStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}
