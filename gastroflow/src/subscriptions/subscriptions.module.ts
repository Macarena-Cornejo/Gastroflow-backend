import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Subscription } from './entities/subscription.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { MailService } from '../mail/mail.service';
import { SubscriptionsCronService } from './subscriptions-cron.service';
import { NotificationLog } from '../notification/entities/notification-log.entity';
import { MailModule } from '../mail/mail.module';

@Module({
<<<<<<< HEAD
  imports: [
    TypeOrmModule.forFeature([Subscription, Restaurant, NotificationLog]),
    MailModule,
  ],
  providers: [SubscriptionsService, SubscriptionsCronService],
=======
  imports: [TypeOrmModule.forFeature([Subscription, Restaurant])],
  providers: [SubscriptionsService, MailService, SubscriptionsCronService],
>>>>>>> origin/dev
  controllers: [SubscriptionsController],
  exports: [SubscriptionsService, SubscriptionsCronService],
})
export class SubscriptionsModule {}
