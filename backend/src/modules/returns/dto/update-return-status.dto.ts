import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum ReturnStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UpdateReturnStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(ReturnStatus)
  status: ReturnStatus;
}
