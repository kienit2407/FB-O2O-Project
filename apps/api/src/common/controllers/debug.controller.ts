import { Controller, Post, Body, Logger } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';
import { Public } from '../decorators/public.decorator';

@Controller('debug/kafka')
@Public()
export class DebugKafkaController {
  private readonly logger = new Logger(DebugKafkaController.name);

  constructor(private kafkaService: KafkaService) {}

  @Post('publish')
  async publishEvent(@Body() body: {
    eventName: string;
    data: any;
    trace?: { correlation_id: string; request_id?: string; user_id?: string };
  }) {
    if (process.env.NODE_ENV === 'production') {
      return {
        statusCode: 403,
        message: 'Debug endpoint not available in production',
        success: false,
      };
    }

    this.logger.log(`[Debug] Publishing event: ${body.eventName}`);

    await this.kafkaService.publish(
      body.eventName,
      body.data,
      body.trace,
    );

    return {
      statusCode: 200,
      message: 'Event published to Kafka successfully',
      success: true,
      data: {
        event_name: body.eventName,
        trace: body.trace,
      },
    };
  }

  @Post('publish/order-created')
  async publishOrderCreated(@Body() body: {
    order_id?: string;
    order_number?: string;
    customer_user_id?: string;
    merchant_id?: string;
    total_amount?: number;
  }) {
    if (process.env.NODE_ENV === 'production') {
      return {
        statusCode: 403,
        message: 'Debug endpoint not available in production',
        success: false,
      };
    }

    const eventData = {
      order_id: body.order_id || 'test-order-id',
      order_number: body.order_number || 'ORD-TEST-001',
      customer_user_id: body.customer_user_id || 'test-user-id',
      merchant_id: body.merchant_id || 'test-merchant-id',
      total_amount: body.total_amount || 150000,
    };

    this.logger.log(`[Debug] Publishing order.created event`);

    await this.kafkaService.publish('ORDERS_CREATED', eventData);

    return {
      statusCode: 200,
      message: 'Order created event published successfully',
      success: true,
      data: eventData,
    };
  }
}
