import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { MessagePattern } from '@nestjs/microservices';

export const PRODUCT_SERVICE = 'PRODUCT_SERVICE';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject(PRODUCT_SERVICE)
    private readonly productClient: ClientProxy,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findOneWithProducts(id: number): Promise<any> {
    const order = await this.findOne(id);

    const productDetails = await Promise.all(
      order.items.map(async (item) => {
        const product = await this.productClient
          .send('get_product', item.productId)
          .toPromise();
        return {
          ...item,
          product,
        };
      }),
    );

    return {
      ...order,
      items: productDetails,
    };
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    for (const item of createOrderDto.items) {
      const stockCheck = await this.productClient
        .send('validate_stock', {
          productId: item.productId,
          quantity: item.quantity,
        })
        .toPromise();

      if (!stockCheck.available) {
        throw new BadRequestException(
          `Insufficient stock for product ${item.productId}`,
        );
      }
    }

    for (const item of createOrderDto.items) {
      await this.productClient
        .send('update_stock', {
          productId: item.productId,
          quantity: item.quantity,
        })
        .toPromise();
    }

    const order = this.orderRepository.create(createOrderDto);
    return this.orderRepository.save(order);
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }

  @MessagePattern('get_order')
  async getOrder(orderId: number): Promise<Order> {
    return this.findOne(orderId);
  }
}
