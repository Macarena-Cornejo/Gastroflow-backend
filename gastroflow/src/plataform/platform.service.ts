import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { RestaurantVerificationDocument } from '../restaurant-verification/entities/restaurant-verification-document.entity';
import { RestaurantVerificationStatus } from '../common/restaurant-verification-status.enum';
import { PlatformReviewRestaurantDto } from './dto/platform-review-restaurant.dto';

import { MailService } from '../mail/mail.service';

import { Subscription } from '../subscriptions/entities/subscription.entity';
import { SubscriptionStatus } from '../subscriptions/enums/subscription-status.enum';
import { PlanType } from '../subscriptions/enums/plan-type.enum';

@Injectable()
export class PlatformService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,

    @InjectRepository(RestaurantVerificationDocument)
    private readonly documentRepository: Repository<RestaurantVerificationDocument>,

    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,

    private readonly mailService: MailService,
  ) {}

  async getPendingRestaurants(): Promise<Restaurant[]> {
    return this.restaurantRepository.find({
      where: { verification_status: RestaurantVerificationStatus.PENDING },
      relations: ['verification_documents'],
    });
  }

  async reviewRestaurant(
    restaurantId: string,
    dto: PlatformReviewRestaurantDto,
  ): Promise<{ message: string }> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
      relations: ['users'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    const ownerEmail =
      Array.isArray(restaurant.users) &&
      typeof restaurant.users[0]?.email === 'string'
        ? restaurant.users[0].email
        : undefined;

    if (dto.status === RestaurantVerificationStatus.REJECTED) {
      restaurant.verification_status = RestaurantVerificationStatus.REJECTED;

      await this.restaurantRepository.save(restaurant);

      if (ownerEmail) {
        await this.mailService.sendGenericNotification(
          ownerEmail,
          'Solicitud rechazada',
          `Tu restaurante "${restaurant.name}" fue rechazado. Motivo: ${
            dto.notes ?? 'No especificado'
          }`,
        );
      }

      return {
        message: 'Restaurante rechazado correctamente',
      };
    }

    if (dto.status === RestaurantVerificationStatus.APPROVED) {
      restaurant.verification_status = RestaurantVerificationStatus.APPROVED;

      await this.restaurantRepository.save(restaurant);

      const startDate = new Date();
      const endDate = this.addMonths(startDate, 1);

      const subscription = this.subscriptionRepository.create({
        restaurant,
        restaurant_id: restaurant.id,
        plan_type: PlanType.BASIC,
        status: SubscriptionStatus.ACTIVE,
        start_date: startDate,
        end_date: endDate,
        next_payment_date: endDate,
        auto_renew: true,
      });

      await this.subscriptionRepository.save(subscription);

      if (ownerEmail) {
        await this.mailService.sendGenericNotification(
          ownerEmail,
          'Restaurante aprobado 🎉',
          `Tu restaurante "${restaurant.name}" ha sido aprobado. Ya puedes acceder al sistema.`,
        );
      }

      return {
        message: 'Restaurante aprobado y suscripción creada correctamente',
      };
    }

    return {
      message: 'Estado de revisión no válido',
    };
  }

  async getRestaurantDocuments(
    restaurantId: string,
  ): Promise<RestaurantVerificationDocument[]> {
    return this.documentRepository.find({
      where: { restaurant: { id: restaurantId } },
    });
  }

  private addMonths(date: Date, months: number): Date {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  }
}
