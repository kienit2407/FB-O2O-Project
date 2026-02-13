import { Body, Controller, Delete, Get, Patch, Post, Put, UseGuards, Param } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { MerchantsService } from '../services/merchants.service';
import { ProductOptionsService } from '../services/product-options.service';
import { getMerchantOrThrow } from '../utils/get-merchant-or-throw';
import { CreateChoiceDto, CreateOptionGroupDto, UpdateChoiceDto, UpdateOptionGroupDto } from '../dtos/product-option.dto';
import { JwtAuthGuard } from 'src/modules/auth';

@Controller('merchant/menu')
@UseGuards(JwtAuthGuard)
export class ProductOptionsController {
  constructor(
    private readonly merchantsService: MerchantsService,
    private readonly productOptionsService: ProductOptionsService,
  ) {}

  @Get('products/:productId/options')
  async list(@CurrentUser() user: any, @Param('productId') productId: string) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    return this.productOptionsService.listByProduct(merchant._id.toString(), productId);
  }

  @Post('products/:productId/options')
  async createGroup(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
    @Body() dto: CreateOptionGroupDto,
  ) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    return this.productOptionsService.createGroup(merchant._id.toString(), productId, dto as any);
  }

  @Put('products/:productId/options/reorder')
  async reorderGroups(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
    @Body() body: { orderedIds: string[] },
  ) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    return this.productOptionsService.reorderGroups(merchant._id.toString(), productId, body.orderedIds || []);
  }

  @Patch('options/:id')
  async updateGroup(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateOptionGroupDto) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    return this.productOptionsService.updateGroup(merchant._id.toString(), id, dto as any);
  }

  @Delete('options/:id')
  async deleteGroup(@CurrentUser() user: any, @Param('id') id: string) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    return this.productOptionsService.softDeleteGroup(merchant._id.toString(), id);
  }

  @Post('options/:id/choices')
  async addChoice(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: CreateChoiceDto) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    return this.productOptionsService.addChoice(merchant._id.toString(), id, dto);
  }

  @Patch('options/:id/choices/:choiceId')
  async updateChoice(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('choiceId') choiceId: string,
    @Body() dto: UpdateChoiceDto,
  ) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    return this.productOptionsService.updateChoice(merchant._id.toString(), id, choiceId, dto);
  }

  @Patch('options/:id/choices/:choiceId/toggle-available')
  async toggleChoiceAvailable(@CurrentUser() user: any, @Param('id') id: string, @Param('choiceId') choiceId: string) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    return this.productOptionsService.toggleChoiceAvailable(merchant._id.toString(), id, choiceId);
  }

  @Patch('options/:id/choices/:choiceId/set-default')
  async setDefault(@CurrentUser() user: any, @Param('id') id: string, @Param('choiceId') choiceId: string) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    return this.productOptionsService.setChoiceDefault(merchant._id.toString(), id, choiceId);
  }

  @Delete('options/:id/choices/:choiceId')
  async deleteChoice(@CurrentUser() user: any, @Param('id') id: string, @Param('choiceId') choiceId: string) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    return this.productOptionsService.deleteChoice(merchant._id.toString(), id, choiceId);
  }
}
