import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsCronService } from './subscriptions-cron.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, Restaurant]), MailModule],
  providers: [SubscriptionsService, SubscriptionsCronService],
  controllers: [SubscriptionsController],
  exports: [SubscriptionsService, SubscriptionsCronService],
})
export class SubscriptionsModule {}
