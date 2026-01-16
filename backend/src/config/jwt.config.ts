import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { StringValue } from 'ms';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  console.log('Loading JWT Config');

  const secret = configService.get<string>('JWT_ACCESS_SECRET');
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
  }

  return {
    secret,
    signOptions: {
      expiresIn: configService.get<StringValue>('JWT_ACCESS_EXPIRES'),
    },
  };
};
