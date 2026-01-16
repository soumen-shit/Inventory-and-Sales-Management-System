/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/database/entities/role.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { SignupAdminDto } from './dto/signup.dto';
import { comparePassword, hashPassword } from 'src/common/utils/password.util';
import { signinDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async signupAdmin(signupDto: SignupAdminDto) {
    console.log('Signup Admin called');
    const adminRole = await this.roleRepo.findOne({
      where: {
        name: 'ADMIN',
      },
    });

    if (!adminRole) {
      throw new ForbiddenException('ADMIN role missing');
    }

    const isAdminExits = await this.userRepo.count({
      where: {
        role: { id: adminRole.id },
      },
    });

    if (isAdminExits > 0) {
      throw new ForbiddenException('ADMIN already exists');
    }

    const hashedPassword = await hashPassword(signupDto.password);
    const user = this.userRepo.create({
      name: signupDto.name,
      email: signupDto.email,
      phone: signupDto.phone,
      password: hashedPassword,
      role: adminRole,
    });

    await this.userRepo.save(user);
    console.log('Admin created');
    return user;
  }

  async signin(signinDto: signinDto) {
    console.log('Signin attempt');

    const user = await this.userRepo.findOne({
      where: {
        email: signinDto.email,
      },
      relations: ['role'],
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    console.log(user);

    const isMatch = await comparePassword(signinDto.password, user.password);

    if (!isMatch) {
      throw new ForbiddenException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      role: user.role.name,
      email: user.email,
    };

    const token = this.jwtService.sign(payload);
    console.log('JWT generated');
    return { token };
  }

  async changePassword(changePasswordDto: ChangePasswordDto, reqData: any) {
    console.log('chnagePasswordDto', changePasswordDto);
    const user = await this.userRepo.findOne({
      where: {
        id: reqData.userId,
      },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }
    console.log(user);

    const isMatch = await comparePassword(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isMatch) {
      throw new ForbiddenException('Invalid credentials');
    }

    user.password = await hashPassword(changePasswordDto.newPassword);

    await this.userRepo.save(user);

    console.log(user);
    return { message: 'Password changed successfully' };
  }
}
