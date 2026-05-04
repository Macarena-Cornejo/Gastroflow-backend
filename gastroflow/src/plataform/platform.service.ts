import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { RestaurantVerificationDocument } from '../restaurant-verification/entities/restaurant-verification-document.entity';
import { RestaurantVerificationStatus } from '../common/restaurant-verification-status.enum';
import { PlatformReviewRestaurantDto } from './dto/platform-review-restaurant.dto';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { SubscriptionStatus } from '../subscriptions/enums/subscription-status.enum';
import { SubscriptionPayment } from '../subscriptions_payments/entities/subscription_payment.entity';
import { SubscriptionPaymentStatus } from '../common/subscription_payment.enum';

@Injectable()
export class PlatformService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,

    @InjectRepository(RestaurantVerificationDocument)
    private readonly documentRepository: Repository<RestaurantVerificationDocument>,

    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,

    @InjectRepository(SubscriptionPayment)
    private readonly subscriptionPaymentRepository: Repository<SubscriptionPayment>,
  ) {}

  async getPendingRestaurants() {
    return await this.restaurantRepository.find({
      where: {
        verification_status: RestaurantVerificationStatus.PENDING,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async getRestaurantReviewDetail(restaurantId: string) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    const documents = await this.documentRepository.find({
      where: {
        restaurant_id: restaurant.id,
      },
      order: {
        created_at: 'ASC',
      },
    });

    return {
      restaurant,
      documents,
    };
  }

  async approveRestaurant(
    restaurantId: string,
    platformUserId: string,
    dto: PlatformReviewRestaurantDto,
  ) {
    const restaurant = await this.findRestaurantOrFail(restaurantId);

    restaurant.is_active = true;
    restaurant.verification_status = RestaurantVerificationStatus.APPROVED;
    restaurant.verification_notes = dto.notes ?? null;
    restaurant.verified_at = new Date();
    restaurant.verified_by_user_id = platformUserId;

    return await this.restaurantRepository.save(restaurant);
  }

  async rejectRestaurant(
    restaurantId: string,
    platformUserId: string,
    dto: PlatformReviewRestaurantDto,
  ) {
    const restaurant = await this.findRestaurantOrFail(restaurantId);

    restaurant.is_active = false;
    restaurant.verification_status = RestaurantVerificationStatus.REJECTED;
    restaurant.verification_notes = dto.notes ?? null;
    restaurant.verified_at = new Date();
    restaurant.verified_by_user_id = platformUserId;

    return await this.restaurantRepository.save(restaurant);
  }

  async suspendRestaurant(
    restaurantId: string,
    platformUserId: string,
    dto: PlatformReviewRestaurantDto,
  ) {
    const restaurant = await this.findRestaurantOrFail(restaurantId);

    restaurant.is_active = false;
    restaurant.verification_status = RestaurantVerificationStatus.SUSPENDED;
    restaurant.verification_notes = dto.notes ?? null;
    restaurant.verified_at = new Date();
    restaurant.verified_by_user_id = platformUserId;

    return await this.restaurantRepository.save(restaurant);
  }

  async getActiveSubscriptions() {
    const subscriptions = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['restaurant'],
      order: {
        end_date: 'ASC',
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return subscriptions.map((subscription) => {
      const endDate = new Date(subscription.end_date);
      endDate.setHours(0, 0, 0, 0);

      const diffInMs = endDate.getTime() - today.getTime();
      const daysRemaining = Math.max(
        0,
        Math.ceil(diffInMs / (1000 * 60 * 60 * 24)),
      );

      return {
        id: subscription.id,
        restaurant: {
          id: subscription.restaurant?.id,
          name: subscription.restaurant?.name,
          slug: subscription.restaurant?.slug,
          email: subscription.restaurant?.email,
        },
        plan_type: subscription.plan_type,
        status: subscription.status,
        start_date: subscription.start_date,
        end_date: subscription.end_date,
        next_payment_date: subscription.next_payment_date ?? null,
        auto_renew: subscription.auto_renew,
        days_remaining: daysRemaining,
      };
    });
  }

  async getSubscriptionRevenueMetrics() {
    const completedStatus = SubscriptionPaymentStatus.COMPLETED;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const totalRevenueRows = await this.subscriptionPaymentRepository
      .createQueryBuilder('payment')
      .select('payment.currency', 'currency')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'total')
      .addSelect('COUNT(payment.id)', 'payments_count')
      .where('payment.status = :status', { status: completedStatus })
      .groupBy('payment.currency')
      .getRawMany();

    const currentMonthRevenueRows = await this.subscriptionPaymentRepository
      .createQueryBuilder('payment')
      .select('payment.currency', 'currency')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'total')
      .addSelect('COUNT(payment.id)', 'payments_count')
      .where('payment.status = :status', { status: completedStatus })
      .andWhere('payment.paid_at >= :monthStart', { monthStart })
      .groupBy('payment.currency')
      .getRawMany();

    const paymentStatusRows = await this.subscriptionPaymentRepository
      .createQueryBuilder('payment')
      .select('payment.status', 'status')
      .addSelect('COUNT(payment.id)', 'total')
      .groupBy('payment.status')
      .getRawMany();

    const normalizeMoneyRows = (
      rows: { currency: string; total: string; payments_count: string }[],
    ) =>
      rows.map((row) => ({
        currency: row.currency,
        total: Number(row.total),
        payments_count: Number(row.payments_count),
      }));

    return {
      generated_at: new Date(),
      total_revenue: normalizeMoneyRows(totalRevenueRows),
      current_month_revenue: normalizeMoneyRows(currentMonthRevenueRows),
      payment_status_counts: paymentStatusRows.map(
        (row: { status: string; total: string }) => ({
          status: row.status,
          total: Number(row.total),
        }),
      ),
    };
  }

  private async findRestaurantOrFail(restaurantId: string) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    return restaurant;
  }
  async getRestaurants(status?: RestaurantVerificationStatus) {
    return await this.restaurantRepository.find({
      where: status
        ? {
            verification_status: status,
          }
        : {},
      order: {
        created_at: 'DESC',
      },
    });
  }
}
