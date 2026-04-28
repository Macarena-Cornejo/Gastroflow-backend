import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { Subscription } from './entities/subscription.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SubscriptionsCronService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleSubscriptionRemnders() {
    const today = new Date();

    const in3Days = new Date();
    in3Days.setDate(today.getDate() + 3);

    const subscriptions = await this.subscriptionRepo.find({
      relations: ['restaurant'],
    });

    for (const sub of subscriptions) {
      if (!sub.end_date) continue;

      const endDate = new Date(sub.end_date);

      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 3 || diffDays === 1) {
        if (sub.restaurant?.email) {
          await this.mailService.sendGenericNotification(
            sub.restaurant.email,
            'Tu suscripción está por vencer',
            `Tu plan ${sub.plan_type} vence en ${diffDays} día(s).`,
          );
        }
      }
    }
  }
}
