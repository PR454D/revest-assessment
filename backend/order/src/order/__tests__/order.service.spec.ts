import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { OrderService } from '../order.service';
import { Order } from '../entities/order.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const createMockHttpService = (): Partial<HttpService> => ({
  post: jest.fn(),
  get: jest.fn(),
});

describe('OrderService', () => {
  let service: OrderService;
  let repository: MockRepository<Order>;
  let httpService: Partial<HttpService>;

  const mockOrder: Order = {
    id: 1,
    items: [{ productId: 1, quantity: 2 }],
    totalAmount: 59.98,
    status: 'pending',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    httpService = createMockHttpService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: createMockRepository(),
        },
        {
          provide: HttpService,
          useValue: httpService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    repository = module.get<MockRepository<Order>>(getRepositoryToken(Order));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      repository.find!.mockResolvedValue([mockOrder]);

      const result = await service.findAll();

      expect(result).toEqual([mockOrder]);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no orders exist', async () => {
      repository.find!.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      repository.findOne!.mockResolvedValue(mockOrder);

      const result = await service.findOne(1);

      expect(result).toEqual(mockOrder);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when order not found', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new order after validating stock', async () => {
      const createDto = {
        items: [{ productId: 1, quantity: 2 }],
        totalAmount: 59.98,
      };

      (httpService.post as jest.Mock)
        .mockReturnValueOnce(of({ data: { available: true } }))
        .mockReturnValueOnce(of({ data: { id: 1, stock: 8 } }));

      repository.create!.mockReturnValue(mockOrder);
      repository.save!.mockResolvedValue(mockOrder);

      const result = await service.create(createDto);

      expect(result).toEqual(mockOrder);
      expect(httpService.post).toHaveBeenCalledWith('/products/validate-stock', {
        productId: 1,
        quantity: 2,
      });
      expect(httpService.post).toHaveBeenCalledWith('/products/update-stock', {
        productId: 1,
        quantity: 2,
      });
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      const createDto = {
        items: [{ productId: 1, quantity: 100 }],
        totalAmount: 2999,
      };

      (httpService.post as jest.Mock).mockReturnValueOnce(
        of({ data: { available: false } }),
      );

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const updateDto = { status: 'confirmed' };
      const updatedOrder = { ...mockOrder, status: 'confirmed' };

      repository.findOne!.mockResolvedValue(mockOrder);
      repository.save!.mockResolvedValue(updatedOrder);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedOrder);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when updating non-existent order', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.update(999, { status: 'confirmed' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an order', async () => {
      repository.findOne!.mockResolvedValue(mockOrder);
      repository.remove!.mockResolvedValue(mockOrder);

      await service.remove(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.remove).toHaveBeenCalledWith(mockOrder);
    });

    it('should throw NotFoundException when removing non-existent order', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
