import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/database/entities/role.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword } from 'src/common/utils/password.util';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    console.log('Creating user:', createUserDto.role);

    const role = await this.roleRepo.findOne({
      where: {
        name: createUserDto.role,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (createUserDto.role === 'ADMIN') {
      throw new BadRequestException('ADMIN user already present in system');
    }

    const hashedPassword = await hashPassword(createUserDto.password);

    const user = this.userRepo.create({
      name: createUserDto.name,
      email: createUserDto.email,
      phone: createUserDto.phone,
      role: role,
      password: hashedPassword,
    });
    return this.userRepo.save(user);
  }

  async findAllUsers() {
    const users = await this.userRepo.find({
      relations: ['role'],
    });

    return users;
  }

  async findUserById(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['role'],
    });

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }
    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    if (updateUserDto.phone) {
      user.phone = updateUserDto.phone;
    }
    if (typeof updateUserDto.is_active === 'boolean') {
      user.is_active = updateUserDto.is_active;
    }

    if (updateUserDto.role) {
      const role = await this.roleRepo.findOne({
        where: {
          name: updateUserDto.role,
        },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      user.role = role;
    }

    await this.userRepo.save(user);

    return user;
  }

  async getRoles() {
    const roles = await this.roleRepo.find({
      relations: ['users'],
    });
    return roles;
  }
}
