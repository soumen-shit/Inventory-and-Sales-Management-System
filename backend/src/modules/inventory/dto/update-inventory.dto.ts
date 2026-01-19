import { PartialType } from '@nestjs/mapped-types';
import { createInventoryDto } from './create-inventory.dto';

export class UpdateInventoryDto extends PartialType(createInventoryDto) {}
