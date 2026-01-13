import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3001', // Hanya izinkan Frontend kita
    credentials: true, // Izinkan kirim cookie/header auth
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
