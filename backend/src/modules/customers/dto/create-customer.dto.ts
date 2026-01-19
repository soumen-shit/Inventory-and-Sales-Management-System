import {
  IsBoolean,
  IsDecimal,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  credit_limit: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
