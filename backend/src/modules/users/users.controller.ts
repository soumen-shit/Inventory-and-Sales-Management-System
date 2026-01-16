import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuird } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuird, RolesGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  createUser(@Body() createUserDto: CreateUserDto) {
    console.log('Create user request');
    return this.userService.createUser(createUserDto);
  }

  @Get()
  @Roles('ADMIN')
  findAllUser() {
    return this.userService.findAllUsers();
  }

  @Get('roles')
  @Roles('ADMIN')
  getRoles() {
    console.log('hi');
    return this.userService.getRoles();
  }

  @Get(':id')
  @Roles('ADMIN')
  findUserById(@Param('id') id: string) {
    return this.userService.findUserById(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }
}
