import { IsInt, IsOptional } from 'class-validator';

export class createInventoryDto {
  @IsInt()
  @IsOptional()
  quantity?: number;
}
