import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { UsersModule } from './modules/users/users.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CommonModule } from './common/common.module';
import { ApiStandardModule } from './common/modules/api-standard.module';
import { KafkaModule } from './common/kafka/kafka.module';
import { SeedModule } from './modules/seed/seed.module';
import { SessionMiddleware, RateLimitMiddleware } from './middleware';

@Module({
  imports: [
    ConfigModule,
    CommonModule,
    ApiStandardModule,
    KafkaModule,
    DatabaseModule,
    AuthModule,
    AdminModule,
    UsersModule,
    MerchantsModule,
    OrdersModule,
    PaymentsModule,
    PromotionsModule,
    NotificationsModule,
    SeedModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply middleware to all routes
    consumer
      .apply(SessionMiddleware)
      .forRoutes('*');

    // Rate limiting - apply to all API routes
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes('*');
  }
}
