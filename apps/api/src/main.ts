import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // 👇 TAMBAHKAN LOG INI (Hanya untuk debugging env)
  const secret = process.env.JWT_SECRET;
  console.log("-------------------------------------------");
  console.log("🧐 ENV CHECKER");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ TERBACA" : "❌ GAGAL BACA");
  console.log("JWT_SECRET:", secret ? `✅ TERBACA (${secret.substring(0, 3)}***)` : "❌ GAGAL (Pakai Fallback)");
  console.log("-------------------------------------------");

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();