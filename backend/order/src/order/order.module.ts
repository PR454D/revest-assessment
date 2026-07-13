import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'order.sqlite',
      entities: [Order],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Order]),
    HttpModule.register({
      baseURL: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
    }),
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
