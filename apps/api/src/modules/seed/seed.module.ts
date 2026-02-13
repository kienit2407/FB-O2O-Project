import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { MerchantsModule } from '../merchants/merchants.module';

@Module({
  imports: [MerchantsModule],
  controllers: [SeedController],
})
export class SeedModule {}
