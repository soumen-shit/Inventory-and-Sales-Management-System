import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';
import { JwtAuthGuird } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';

@Controller('returns')
@UseGuards(JwtAuthGuird, RolesGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  createReturn(@Body() createReturnDto: CreateReturnDto) {
    return this.returnsService.createReturn(createReturnDto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('customer_id') customer_id?: string,
    @Query('status') status?: string,
    @Query('from_date') from_date?: string,
    @Query('to_date') to_date?: string,
  ) {
    return this.returnsService.findAll({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      customer_id,
      status,
      from_date,
      to_date,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  findOne(@Param('id') id: string) {
    return this.returnsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'MANAGER')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReturnStatusDto,
  ) {
    return this.returnsService.updateStatus(id, updateStatusDto.status);
  }
}
