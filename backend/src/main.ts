import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.use(cookieParser());
    app.setGlobalPrefix('api');
    await app.listen(process.env.PORT ?? 3000);
  } catch (error) {
    console.log('Server error', error);
    process.exit(1);
  }
}
void bootstrap();
