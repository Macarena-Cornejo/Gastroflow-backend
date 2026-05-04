import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { RestaurantVerificationDocument } from '../restaurant-verification/entities/restaurant-verification-document.entity';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { SubscriptionPayment } from '../subscriptions_payments/entities/subscription_payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Restaurant,
      RestaurantVerificationDocument,
      Subscription,
      SubscriptionPayment,
    ]),
  ],
  controllers: [PlatformController],
  providers: [PlatformService],
})
export class PlatformModule {}
