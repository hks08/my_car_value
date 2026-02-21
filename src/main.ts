import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
const cookieSession = require('cookie-session');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieSession({
    keys: ['hhkjh643h5jkh5kjh2k5jh34kjhkjh634jkh64jkh6'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically remove properties that do not have any decorators
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    })
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
