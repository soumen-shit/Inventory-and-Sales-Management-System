import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateRefundDto {
  @IsUUID()
  @IsNotEmpty()
  return_id: string;

  @IsDateString()
  @IsNotEmpty()
  refund_date: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsUUID()
  @IsOptional()
  payment_method_id?: string;

  @IsString()
  @IsNotEmpty()
  reference_number: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}
