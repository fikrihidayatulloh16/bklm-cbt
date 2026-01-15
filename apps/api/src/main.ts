import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3001', 
      process.env.FRONTEND_URL, // Ini akan baca dari .env server (https://app1.mfh.web.id)
      'https://app1.mfh.web.id'
    ], // Hanya izinkan Frontend kita
    credentials: true, // Izinkan kirim cookie/header auth
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
