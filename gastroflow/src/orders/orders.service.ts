import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from './enums/order-status.enum';
import { RestaurantTables } from '../restaurant_tables/entities/restaurant_table.entity';
import { RestaurantTableStatus } from '../common/restaurant_table.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(RestaurantTables)
    private tablesRepository: Repository<RestaurantTables>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { restaurant_id, table_id, items, total_amount, waiter_id, observations } =
      createOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('La orden debe contener al menos un item');
    }

    // Verificar que la mesa existe
    const table = await this.tablesRepository.findOne({
      where: { id: table_id, restaurant: { id: restaurant_id } },
    });
    if (!table) {
      throw new NotFoundException('Mesa no encontrada en este restaurante');
    }

    // Crear la orden
    const order = this.ordersRepository.create({
      restaurant: { id: restaurant_id },
      table: { id: table_id },
      waiter: waiter_id ? { id: waiter_id } : undefined,
      items,
      total_amount,
      status: OrderStatus.PENDING,
      observations,
    });

    // Cambiar estado de mesa a "Ocupada"
    await this.tablesRepository.update(
      { id: table_id },
      { status: RestaurantTableStatus.OCUPPED },
    );

    return this.ordersRepository.save(order);
  }

  async getOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { restaurant: { id: restaurantId } },
      relations: ['table', 'waiter', 'restaurant'],
      order: { created_at: 'DESC' },
    });
  }

  async getOrdersByTable(tableId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { table: { id: tableId } },
      relations: ['restaurant', 'waiter'],
      order: { created_at: 'DESC' },
    });
  }

  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['table', 'waiter', 'restaurant'],
    });
    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }
    return order;
  }

  async updateOrderStatus(
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.getOrderById(orderId);

    const { status, observations } = updateOrderStatusDto;

    // Validar transiciones válidas de estado
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.COOKING, OrderStatus.CLOSED],
      [OrderStatus.COOKING]: [OrderStatus.READY, OrderStatus.CLOSED],
      [OrderStatus.READY]: [OrderStatus.CLOSED],
      [OrderStatus.CLOSED]: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      throw new BadRequestException(
        `No se puede cambiar de ${order.status} a ${status}`,
      );
    }

    order.status = status;
    if (observations) {
      order.observations = observations;
    }

    // Si la orden se cierra, cambiar estado de mesa a "Disponible"
    if (status === OrderStatus.CLOSED) {
      await this.tablesRepository.update(
        { id: order.table.id },
        { status: RestaurantTableStatus.AVAILABLE },
      );
    }

    return this.ordersRepository.save(order);
  }

  async deleteOrder(orderId: string): Promise<void> {
    const order = await this.getOrderById(orderId);
    await this.ordersRepository.remove(order);
  }
}
