import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsStrongPassword,
} from 'class-validator';

export class SignupAdminDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
  })
  password: string;

  @IsString()
  @Matches(/^[0-9]{10,15}$/, {
    message: 'Phone number must be 10 to 15 digits',
  })
  phone: string;
}
