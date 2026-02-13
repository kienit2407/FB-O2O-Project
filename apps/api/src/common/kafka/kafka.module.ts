import { Module, Global } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { KafkaService } from './kafka.service';

@Global()
@Module({
  providers: [KafkaService, ConfigService],
  exports: [KafkaService],
})
export class KafkaModule {}
