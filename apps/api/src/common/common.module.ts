import { Module } from '@nestjs/common';
import { DebugKafkaController } from './controllers/debug.controller';
import { CloudinaryService } from './services/cloudinary.service';
import { EmailService } from './services/email.service';

@Module({
  controllers: [DebugKafkaController],
  providers: [CloudinaryService, EmailService],
  exports: [CloudinaryService, EmailService],
})
export class CommonModule {}
