import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  email: string;

  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phone: string;

  @IsString()
  address: string;

  @IsString()
  @IsNotEmpty()
  gst_number: string;

  @IsBoolean()
  @IsOptional()
  is_active: boolean;
}
