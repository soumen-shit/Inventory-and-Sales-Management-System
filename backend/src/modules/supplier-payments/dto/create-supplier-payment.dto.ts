import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { SupplierPaymentStatus } from 'src/enums/supplier-payment-status.enum';

export class CreateSupplierPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  supplier_id: string;

  @IsUUID()
  @IsOptional()
  purchase_order_id?: string;

  @IsDateString()
  @IsNotEmpty()
  payment_date: string;

  @IsNumber()
  amount: number;

  @IsUUID()
  @IsOptional()
  payment_method_id?: string;

  @IsEnum(SupplierPaymentStatus)
  @IsOptional()
  status: SupplierPaymentStatus;
}
