import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseOrderItemDto } from './create-puchase-order-item.dto';

export class UpdatePurchaseOrderItemDto extends PartialType(
  CreatePurchaseOrderItemDto,
) {}
