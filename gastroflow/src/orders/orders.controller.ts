import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AuthGuard } from '../auth/guards/Auth.guard';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get('restaurant/:restaurantId')
  async getOrdersByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.getOrdersByRestaurant(restaurantId);
  }

  @Get('table/:tableId')
  async getOrdersByTable(@Param('tableId') tableId: string) {
    return this.ordersService.getOrdersByTable(tableId);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, updateOrderStatusDto);
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: string) {
    await this.ordersService.deleteOrder(id);
    return { message: 'Orden eliminada' };
  }
}
