import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderCreatedConsumer } from './consumers';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'fab-o2o-api-notifications',
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
          },
          consumer: {
            groupId: 'fab-o2o-notifications-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [OrderCreatedConsumer],
})
export class NotificationsModule {}
