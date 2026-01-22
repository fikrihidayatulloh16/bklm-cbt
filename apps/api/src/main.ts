import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ambil URL Frontend dari ENV untuk whitelist CORS
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";

  app.enableCors({
    origin: frontendUrl, // Hanya izinkan frontend ini yang mengakses
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
