import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MerchantsModule } from '../merchants/merchants.module';
import { Merchant, MerchantSchema } from '../merchants/schemas/merchant.schema';
import { AdminApprovalController } from '../../admin/controllers/admin-approval.controller';

@Module({
  imports: [
    MerchantsModule,
    MongooseModule.forFeature([
      { name: Merchant.name, schema: MerchantSchema },
    ]),
  ],
  controllers: [
    AdminApprovalController,
  ],
  providers: [],
  exports: [],
})
export class AdminModule {}
