import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Merchant, MerchantSchema } from './schemas/merchant.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { Product, ProductSchema } from './schemas/product.schema';
import { Topping, ToppingSchema } from './schemas/topping.schema';
import { ProductOption, ProductOptionSchema } from './schemas/product-option.schema';

import { MerchantsService } from './services/merchants.service';
import { ToppingsService } from './services/toppings.service';
import { CategoriesService } from './services/categories.service';
import { ProductsService } from './services/products.service';
import { ProductOptionsService } from './services/product-options.service';

import { CategoriesController } from './controllers/categories.controller';
import { ProductsController } from './controllers/products.controller';
import { ToppingsController } from './controllers/toppings.controller';
import { ProductOptionsController } from './controllers/product-options.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([
      { name: Merchant.name, schema: MerchantSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
      { name: Topping.name, schema: ToppingSchema },
      { name: ProductOption.name, schema: ProductOptionSchema },
    ]),
  ],
  controllers: [
    CategoriesController,
    ProductsController,
    ToppingsController,
    ProductOptionsController,
  ],
  providers: [
    MerchantsService,
    ToppingsService,
    CategoriesService,
    ProductsService,
    ProductOptionsService,
  ],
  exports: [MerchantsService, ToppingsService, CategoriesService, ProductsService, ProductOptionsService],
})
export class MerchantsModule { }
