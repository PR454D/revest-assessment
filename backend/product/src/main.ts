import { NestFactory } from '@nestjs/core';
import { Transport, TcpOptions } from '@nestjs/microservices';
import { ProductModule } from './product/product.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductModule);

  app.connectMicroservice<TcpOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 4001,
    },
  });

  app.enableCors();

  await app.startAllMicroservices();
  await app.listen(3001);
}
bootstrap();
