import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class signinDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  password: string;
}
