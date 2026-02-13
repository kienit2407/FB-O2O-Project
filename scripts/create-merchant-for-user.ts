/**
 * Script để tạo merchant cho user đã tồn tại
 * Chạy với: ts-node scripts/create-merchant-for-user.ts <user_id> <email>
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../apps/api/src/app.module';
import { MerchantsService } from '../apps/api/src/modules/merchants/services/merchants.service';

async function createMerchantForUser() {
  const args = process.argv.slice(2);
  const userId = args[0];
  const email = args[1];

  if (!userId || !email) {
    console.log('Usage: ts-node scripts/create-merchant-for-user.ts <user_id> <email>');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  const merchantsService = app.get(MerchantsService);

  try {
    console.log(`Creating merchant for user ${userId} (${email})...`);

    const merchant = await merchantsService.create({
      owner_user_id: userId,
      email: email,
      name: 'Test Merchant',
      phone: '',
      approval_status: 'draft' as any,
      onboarding_step: 1,
    });

    console.log('Merchant created successfully:', {
      id: merchant._id,
      name: merchant.name,
      email: merchant.email,
      owner_user_id: merchant.owner_user_id,
    });
  } catch (error) {
    console.error('Error creating merchant:', error);
  } finally {
    await app.close();
  }
}

createMerchantForUser();
