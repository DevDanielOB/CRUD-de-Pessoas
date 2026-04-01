import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  const nodeEnv = process.env.BACKEND_NODE_ENV ?? process.env.NODE_ENV ?? 'development';
  const swaggerEnabled = process.env.SWAGGER_ENABLED
    ? process.env.SWAGGER_ENABLED !== 'false'
    : nodeEnv !== 'production';
  const appUrl = (process.env.APP_URL ?? `http://localhost:${port}`).replace(/\/$/, '');
  const swaggerPath = 'api';
  const swaggerUrl = `${appUrl}/${swaggerPath}`;

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('CRUD de Pessoas API')
    .setDescription('API para gerenciamento de pessoas')
    .setVersion('1.0')
    .addServer(appUrl)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Informe o token JWT no formato: Bearer <token>',
      },
      'JWT-auth',
    )
    .build();

  if (swaggerEnabled) {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document);
  }

  await app.listen(port);

  if (swaggerEnabled) {
    console.log(`Documentação Swagger disponível em: ${swaggerUrl}`);
    return;
  }

  console.log('Swagger desabilitado para este ambiente.');
}
bootstrap();
