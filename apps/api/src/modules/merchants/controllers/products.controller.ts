import {
  Body, Controller, Delete, Get, Patch, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors, Param,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { MerchantsService } from '../services/merchants.service';
import { ProductsService } from '../services/products.service';
import { CreateProductDto, UpdateProductDto } from '../dtos/product.dto';
import { getMerchantOrThrow } from '../utils/get-merchant-or-throw';
import { CloudinaryService } from 'src/common/services/cloudinary.service';
import { JwtAuthGuard } from 'src/modules/auth';

@Controller('merchant/menu/products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    private readonly merchantsService: MerchantsService,
    private readonly productsService: ProductsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: any,
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: 'all' | 'available' | 'unavailable',
  ) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    return this.productsService.list(merchant._id.toString(), { q, categoryId, status: status || 'all' });
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateProductDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);

    const image_urls: string[] = [];
    if (images?.length) {
      for (const file of images) {
        const up = await this.cloudinary.uploadImage(file, `merchants/${merchant._id}/products`);
        image_urls.push(up.secure_url || up.url);
      }
    }

    return this.productsService.create(merchant._id.toString(), {
      ...dto,
      image_urls,
    } as any);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images'))
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() images?: Express.Multer.File[],
    @Query('replaceImages') replaceImages?: string,
  ) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);

    let image_urls: string[] | undefined;
    if (images?.length) {
      image_urls = [];
      for (const file of images) {
        const up = await this.cloudinary.uploadImage(file, `merchants/${merchant._id}/products`);
        image_urls.push(up.secure_url || up.url);
      }
    }

    // nếu replaceImages=1 => set image_urls mới, không thì append ở FE (hoặc bạn làm append trong BE tuỳ ý)
    const patch: any = { ...dto };
    if (image_urls) patch.image_urls = image_urls;

    return this.productsService.update(merchant._id.toString(), id, patch);
  }

  @Patch(':id/toggle-available')
  async toggleAvailable(@CurrentUser() user: any, @Param('id') id: string) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    return this.productsService.toggleAvailable(merchant._id.toString(), id);
  }

  @Put('reorder')
  async reorder(@CurrentUser() user: any, @Body() body: { orderedIds: string[] }) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    return this.productsService.reorder(merchant._id.toString(), body.orderedIds || []);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    const merchant = await getMerchantOrThrow(this.merchantsService, user.sub);
    return this.productsService.softDelete(merchant._id.toString(), id);
  }
}
