import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);

  console.log(process.env.DATABASE_URL);

  console.log(`Aplicação rodando em: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Documentação Swagger disponível em: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
