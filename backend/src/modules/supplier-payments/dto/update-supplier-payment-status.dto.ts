import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { SupplierPaymentStatus } from 'src/enums/supplier-payment-status.enum';

export class UpdateSupplierPaymentStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(SupplierPaymentStatus)
  status: SupplierPaymentStatus;
}
