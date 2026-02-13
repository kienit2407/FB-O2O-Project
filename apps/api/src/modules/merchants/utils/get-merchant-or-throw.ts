import { ForbiddenException } from '@nestjs/common';
import { MerchantsService } from '../services/merchants.service';

export async function getMerchantOrThrow(merchantsService: MerchantsService, ownerUserId: string) {
    const merchant = await merchantsService.findByOwnerUserId(ownerUserId);
    if (!merchant) throw new ForbiddenException('Merchant not found for this user');
    return merchant;
}
