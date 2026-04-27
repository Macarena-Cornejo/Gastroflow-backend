import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { RestaurantTables } from '../../restaurant_tables/entities/restaurant_table.entity';
import { User } from '../../users/entities/user.entity';
import { OrderStatus } from '../enums/order-status.enum';

@Entity({
  name: 'ORDERS',
})
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant!: Restaurant;

  @ManyToOne(() => RestaurantTables, (table) => table.orders)
  @JoinColumn({ name: 'table_id' })
  table!: RestaurantTables;

  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  @JoinColumn({ name: 'waiter_id' })
  waiter?: User;

  @Column({
    type: 'json',
    nullable: false,
  })
  items!: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    observations?: string;
  }>;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  total_amount!: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  observations?: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updated_at!: Date;
}
