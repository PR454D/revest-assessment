import { NestFactory } from '@nestjs/core';
import { ProductModule } from './product/product.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductModule);

  app.enableCors();

  await app.listen(3001);
}
bootstrap();
