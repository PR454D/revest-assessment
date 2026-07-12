import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export interface OrderItem {
  productId: number;
  quantity: number;
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('simple-json')
  items: OrderItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
