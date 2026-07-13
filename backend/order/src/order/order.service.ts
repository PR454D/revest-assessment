import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly httpService: HttpService,
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
        const { data: product } = await firstValueFrom(
          this.httpService.get(`/products/${item.productId}`),
        );
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
      const { data: stockCheck } = await firstValueFrom(
        this.httpService.post('/products/validate-stock', {
          productId: item.productId,
          quantity: item.quantity,
        }),
      );

      if (!stockCheck.available) {
        throw new BadRequestException(
          `Insufficient stock for product ${item.productId}`,
        );
      }
    }

    for (const item of createOrderDto.items) {
      await firstValueFrom(
        this.httpService.post('/products/update-stock', {
          productId: item.productId,
          quantity: item.quantity,
        }),
      );
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
}
