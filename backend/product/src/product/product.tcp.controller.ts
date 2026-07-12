import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';

@Controller()
export class ProductTcpController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern('get_product')
  async getProduct(productId: number): Promise<Product> {
    return this.productService.findOne(productId);
  }

  @MessagePattern('validate_stock')
  async validateStock(data: {
    productId: number;
    quantity: number;
  }): Promise<{ available: boolean }> {
    return this.productService.validateStock(data);
  }

  @MessagePattern('update_stock')
  async updateStock(data: {
    productId: number;
    quantity: number;
  }): Promise<Product> {
    return this.productService.updateStock(data);
  }
}
