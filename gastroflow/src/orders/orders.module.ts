import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { RestaurantTables } from '../restaurant_tables/entities/restaurant_table.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, RestaurantTables])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
