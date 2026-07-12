import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductService } from '../product.service';
import { Product } from '../entities/product.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('ProductService', () => {
  let service: ProductService;
  let repository: MockRepository<Product>;

  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 29.99,
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<MockRepository<Product>>(
      getRepositoryToken(Product),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      repository.find!.mockResolvedValue([mockProduct]);

      const result = await service.findAll();

      expect(result).toEqual([mockProduct]);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no products exist', async () => {
      repository.find!.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      repository.findOne!.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProduct);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when product not found', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createDto = {
        name: 'New Product',
        description: 'New Description',
        price: 49.99,
        stock: 5,
      };

      repository.create!.mockReturnValue(mockProduct);
      repository.save!.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProduct);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto = { name: 'Updated Product', price: 39.99 };
      const updatedProduct = { ...mockProduct, ...updateDto };

      repository.findOne!.mockResolvedValue(mockProduct);
      repository.save!.mockResolvedValue(updatedProduct);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedProduct);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when updating non-existent product', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      repository.findOne!.mockResolvedValue(mockProduct);
      repository.remove!.mockResolvedValue(mockProduct);

      await service.remove(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.remove).toHaveBeenCalledWith(mockProduct);
    });

    it('should throw NotFoundException when removing non-existent product', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateStock', () => {
    it('should return available: true when stock is sufficient', async () => {
      repository.findOne!.mockResolvedValue(mockProduct);

      const result = await service.validateStock({ productId: 1, quantity: 5 });

      expect(result).toEqual({ available: true });
    });

    it('should return available: false when stock is insufficient', async () => {
      repository.findOne!.mockResolvedValue(mockProduct);

      const result = await service.validateStock({
        productId: 1,
        quantity: 15,
      });

      expect(result).toEqual({ available: false });
    });

    it('should throw NotFoundException for non-existent product', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(
        service.validateStock({ productId: 999, quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStock', () => {
    it('should decrement stock when sufficient', async () => {
      repository.findOne!.mockResolvedValue(mockProduct);
      repository.save!.mockResolvedValue({ ...mockProduct, stock: 5 });

      const result = await service.updateStock({ productId: 1, quantity: 5 });

      expect(result.stock).toBe(5);
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      repository.findOne!.mockResolvedValue(mockProduct);

      await expect(
        service.updateStock({ productId: 1, quantity: 15 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent product', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(
        service.updateStock({ productId: 999, quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
