import {
  Body, Controller, Delete, Get, Patch, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors, Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

import { MerchantsService } from '../services/merchants.service';
import { ToppingsService } from '../services/toppings.service';
import { CreateToppingDto, UpdateToppingDto } from '../dtos/topping.dto';
import { getMerchantOrThrow } from '../utils/get-merchant-or-throw';
import { CloudinaryService } from 'src/common/services/cloudinary.service';
import { JwtAuthGuard } from 'src/modules/auth';

@Controller('merchant/menu/toppings')
@UseGuards(JwtAuthGuard)
export class ToppingsController {
  constructor(
    private readonly merchantsService: MerchantsService,
    private readonly toppingsService: ToppingsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: any,
    @Query('includeInactive') includeInactive?: string,
    @Query('onlyAvailable') onlyAvailable?: string,
  ) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    return this.toppingsService.findByMerchantId(merchant._id.toString(), {
      includeInactive: includeInactive === '1',
      onlyAvailable: onlyAvailable === '1',
    });
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateToppingDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);

    let image_url: string | undefined;
    if (image) {
      const up = await this.cloudinary.uploadImage(image, `merchants/${merchant._id}/toppings`);
      image_url = up.secure_url || up.url;
    }

    return this.toppingsService.create({
      merchant_id: merchant._id,
      ...dto,
      ...(image_url ? { image_url } : {}),
    });
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateToppingDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);

    // scope check: topping must belong to merchant
    const top = await this.toppingsService.findById(id);
    if (!top || top.merchant_id.toString() !== merchant._id.toString()) {
      // tránh leak thông tin
      throw new Error('Topping not found');
    }

    let image_url: string | undefined;
    if (image) {
      const up = await this.cloudinary.uploadImage(image, `merchants/${merchant._id}/toppings`);
      image_url = up.secure_url || up.url;
    }

    return this.toppingsService.updateById(id, { ...dto, ...(image_url ? { image_url } : {}) });
  }

  @Patch(':id/toggle-available')
  async toggleAvailable(@CurrentUser() user: any, @Param('id') id: string) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    const top = await this.toppingsService.findById(id);
    if (!top || top.merchant_id.toString() !== merchant._id.toString()) throw new Error('Topping not found');
    return this.toppingsService.toggleAvailability(id);
  }

  @Patch(':id/toggle-active')
  async toggleActive(@CurrentUser() user: any, @Param('id') id: string) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    const top = await this.toppingsService.findById(id);
    if (!top || top.merchant_id.toString() !== merchant._id.toString()) throw new Error('Topping not found');
    return this.toppingsService.toggleActive(id);
  }

  @Put('reorder')
  async reorder(@CurrentUser() user: any, @Body() body: { orderedIds: string[] }) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    // nhớ thêm method reorder trong service như ở trên
    return (this.toppingsService as any).reorder(merchant._id.toString(), body.orderedIds || []);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    const top = await this.toppingsService.findById(id);
    if (!top || top.merchant_id.toString() !== merchant._id.toString()) throw new Error('Topping not found');
    return this.toppingsService.softDelete(id);
  }
}
