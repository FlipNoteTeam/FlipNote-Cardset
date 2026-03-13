import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/common/global-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'cardset',
      protoPath: join(__dirname, 'proto/cardset.proto'),
      url: `0.0.0.0:${process.env.GRPC_PORT ?? 5000}`,
    },
  });

  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalFilters(new GlobalExceptionFilter());

  if (
    process.env.SWAGGER_ENABLED === 'true' ||
    process.env.NODE_ENV !== 'production'
  ) {
    const config = new DocumentBuilder()
      .setTitle('Flip Note API')
      .setDescription('API documentation')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
