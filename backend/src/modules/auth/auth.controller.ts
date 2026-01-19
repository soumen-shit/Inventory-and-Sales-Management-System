/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupAdminDto } from './dto/signup.dto';
import { signinDto } from './dto/signin.dto';
import type { Response } from 'express';
import { JwtAuthGuird } from 'src/common/guards/jwt.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  signupAdmin(@Body() signupDto: SignupAdminDto) {
    console.log('signup request recive');
    return this.authService.signupAdmin(signupDto);
  }

  @Post('signin')
  async signin(
    @Body() signinDto: signinDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = await this.authService.signin(signinDto);
    console.log('token', token);

    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log('JWT cookie set');
    return {
      message: 'Login Success',
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    console.log('Logged out');
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuird)
  @Get('me')
  me(@Req() req: any) {
    console.log('Current user:', req.user);
    return req.user;
  }

  @UseGuards(JwtAuthGuird)
  @Patch('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: any,
  ) {
    return this.authService.changePassword(changePasswordDto, req.user);
  }
}
