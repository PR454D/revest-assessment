import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async validateStock(data: {
    productId: number;
    quantity: number;
  }): Promise<{ available: boolean }> {
    const product = await this.findOne(data.productId);
    return { available: product.stock >= data.quantity };
  }

  async updateStock(data: {
    productId: number;
    quantity: number;
  }): Promise<Product> {
    const product = await this.findOne(data.productId);

    if (product.stock < data.quantity) {
      throw new BadRequestException(
        `Insufficient stock for product ${data.productId}. Available: ${product.stock}, requested: ${data.quantity}`,
      );
    }

    product.stock -= data.quantity;
    return this.productRepository.save(product);
  }
}
