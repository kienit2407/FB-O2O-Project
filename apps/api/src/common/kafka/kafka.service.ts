import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { KAFKA_TOPICS, KAFKA_PRODUCER, KAFKA_VERSION } from './kafka.constants';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private config: any;
  private kafka: any;
  private producer: any;

  constructor(private configService: ConfigService) {
    this.config = {
      brokers: this.configService.kafkaBrokers || 'localhost:9092',
      clientId: this.configService.kafkaClientId || 'fab-o2o-api',
      groupId: this.configService.kafkaGroupId || 'fab-o2o-api-consumer',
      enabled: this.configService.kafkaEnabled === 'true',
    };
  }

  async onModuleInit() {
    if (!this.config.enabled) {
      this.logger.log('Kafka is disabled');
      return;
    }

    try {
      const { Kafka } = await import('kafkajs');
      
      this.kafka = new Kafka({
        clientId: this.config.clientId,
        brokers: this.config.brokers.split(','),
        connectionTimeout: 10000,
        authenticationTimeout: 10000,
        reauthenticationThreshold: 10000,
      });

      this.producer = this.kafka.producer();

      await this.producer.connect();
      this.logger.log('Kafka producer connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Kafka', error.stack);
    }
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
      this.logger.log('Kafka producer disconnected');
    }
  }

  async publish(
    eventName: string,
    data: any,
    trace?: { correlation_id: string; request_id?: string; user_id?: string },
    options?: { maxAttempts?: number; backoffMs?: number },
  ): Promise<void> {
    if (!this.config.enabled || !this.producer) {
      this.logger.debug(`Kafka is disabled or producer not ready, skipping publish to ${eventName}`);
      return;
    }

    const topicKey = Object.keys(KAFKA_TOPICS).find(
      (key) => key === eventName,
    );
    
    const topic = topicKey ? (KAFKA_TOPICS as any)[topicKey] : eventName;
    
    const envelope = {
      event_id: uuidv4(),
      event_name: eventName,
      occurred_at: new Date(),
      producer: KAFKA_PRODUCER,
      version: KAFKA_VERSION,
      data,
      trace: trace || {
        correlation_id: uuidv4(),
      },
    };

    const maxAttempts = options?.maxAttempts || 3;
    const backoffMs = options?.backoffMs || 300;

    await this.publishWithRetry(topic, envelope, maxAttempts, backoffMs);
  }

  private async publishWithRetry(
    topic: string,
    envelope: any,
    maxAttempts: number,
    backoffMs: number,
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.debug(
          `Publishing event ${envelope.event_name} to ${topic} (attempt ${attempt}/${maxAttempts})`,
        );
        
        await this.producer.send({
          topic,
          messages: [
            {
              key: envelope.event_id,
              value: JSON.stringify(envelope),
              headers: {
                'event-id': envelope.event_id,
                'correlation-id': envelope.trace.correlation_id,
                ...(envelope.trace.request_id && { 'request-id': envelope.trace.request_id }),
                ...(envelope.trace.user_id && { 'user-id': envelope.trace.user_id }),
              },
            },
          ],
        });
        
        this.logger.log(
          `Event ${envelope.event_name} published successfully to ${topic}`,
          {
            event_id: envelope.event_id,
            correlation_id: envelope.trace.correlation_id,
          },
        );
        
        return;
      } catch (error: any) {
        this.logger.error(
          `Failed to publish event ${envelope.event_name} (attempt ${attempt}/${maxAttempts})`,
          error.stack,
        );

        if (attempt === maxAttempts) {
          this.logger.error(
            `Failed to publish event ${envelope.event_name} after ${maxAttempts} attempts. Skipping...`,
          );
          return;
        }

        const exponentialBackoff = backoffMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, exponentialBackoff));
      }
    }
  }
}
