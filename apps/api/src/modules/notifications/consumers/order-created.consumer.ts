import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { KAFKA_TOPICS } from '../../../common/kafka/kafka.constants';

@Controller()
export class OrderCreatedConsumer {
  private readonly logger = new Logger(OrderCreatedConsumer.name);

  @EventPattern(KAFKA_TOPICS.ORDERS_CREATED)
  async handleOrderCreated(
    @Payload() envelope: any,
    @Ctx() context: KafkaContext,
  ) {
    const message = context.getMessage();
    
    if (!message) {
      this.logger.warn('[Consumer] No message received');
      return;
    }

    try {
      const value = message.value?.toString();
      
      if (!value) {
        this.logger.warn('[Consumer] No message value');
        return;
      }

      const event = JSON.parse(value);
      
      this.logger.log(`[Consumer] Processing order.created event`, {
        event_id: event.event_id,
        correlation_id: event.trace?.correlation_id,
        order_id: event.data?.order_id,
        order_number: event.data?.order_number,
      });

      await this.sendOrderNotification(event);

      this.logger.log(
        `[Consumer] Order notification sent successfully`,
        {
          event_id: event.event_id,
          correlation_id: event.trace?.correlation_id,
        },
      );
      
    } catch (error) {
      this.logger.error(
        `[Consumer] Failed to process order.created event`,
        {
          error: error.message,
        },
        error.stack,
      );
    }
  }

  private async sendOrderNotification(event: any): Promise<void> {
    this.logger.log(`[Notification] Creating notification for order ${event.data?.order_number}`);
    
    await this.createNotificationRecord({
      user_id: event.data?.customer_user_id,
      type: 'order_created',
      title: 'Order Received',
      message: `Your order #${event.data?.order_number} has been received and is being processed.`,
      data: {
        order_id: event.data?.order_id,
        order_number: event.data?.order_number,
        total_amount: event.data?.total_amount,
      },
    });
  }

  private async createNotificationRecord(notification: any): Promise<any> {
    this.logger.debug(`[Notification] Creating notification record: ${JSON.stringify(notification)}`);
    return notification;
  }
}
