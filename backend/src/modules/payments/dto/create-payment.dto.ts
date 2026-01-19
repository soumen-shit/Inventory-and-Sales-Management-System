import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  invoice_id: string;

  @IsDateString()
  @IsNotEmpty()
  payment_date: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsUUID()
  @IsOptional()
  payment_method_id?: string | null;

  @IsString()
  @IsNotEmpty()
  reference_number: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}
