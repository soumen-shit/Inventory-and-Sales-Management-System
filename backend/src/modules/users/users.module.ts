import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/database/entities/role.entity';
import { User } from 'src/database/entities/user.entity';
import { PurchaseOrder } from 'src/database/entities/purchase-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User, PurchaseOrder])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
