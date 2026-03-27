import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/winston.config';
import { LoggingInterceptor } from './common/utils/interceptors/logging.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.useGlobalInterceptors(new LoggingInterceptor());

  const config = new DocumentBuilder()
    .setTitle('BKLM CBT API')
    .setDescription('Dokumentasi API untuk Sistem Ujian Online')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  app.use(compression());

  if (process.env.NODE_ENV !== 'production') {
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();