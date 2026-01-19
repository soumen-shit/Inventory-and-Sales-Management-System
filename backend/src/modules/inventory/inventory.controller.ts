import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuird } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';

@UseGuards(JwtAuthGuird, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  async findAllInventory() {
    return this.inventoryService.findAllInventory();
  }

  @Get('low-stock')
  @Roles('ADMIN', 'MANAGER')
  async findLowStock() {
    return this.inventoryService.findLowStock();
  }

  @Get(':variantId/variant')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  async findInventoryByVariantId(@Param('variantId') variantId: string) {
    return this.inventoryService.findInventoryByVariantId(variantId);
  }
}
