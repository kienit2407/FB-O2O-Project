import { Controller, Post, UseGuards, HttpException, HttpStatus, Body } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MerchantsService } from '../merchants/services/merchants.service';
import { CategoriesService } from '../merchants/services/categories.service';
import { ProductsService } from '../merchants/services/products.service';
import { ToppingsService } from '../merchants/services/toppings.service';
import { ProductOptionsService } from '../merchants/services/product-options.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('seed')
export class SeedController {
  constructor(
    private readonly merchantsService: MerchantsService,
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly toppingsService: ToppingsService,
    private readonly productOptionsService: ProductOptionsService,
  ) {}

  @Post('menu')
  @UseGuards(JwtAuthGuard)
  async seedMenu(@CurrentUser() user: any) {
    try {
      const userId = user.sub || user.userId;
      const userEmail = user.email;

      console.log('[Seed] Starting menu seeding for user:', userId, userEmail);

      // Step 1: Get merchant
      const merchant = await this.merchantsService.findByOwnerUserId(userId);
      if (!merchant) {
        throw new HttpException('Merchant not found. Please create a merchant first.', HttpStatus.NOT_FOUND);
      }

      console.log('[Seed] Merchant found:', merchant._id);
      const merchantId = merchant._id.toString();

      // Step 2: Create Categories
      const categories = await this.createCategories(merchantId);

      // Step 3: Create Toppings
      const toppings = await this.createToppings(merchantId);

      // Step 4: Create Products
      const products = await this.createProducts(merchantId, categories);

      // Step 5: Create Option Groups
      await this.createOptionGroups(merchantId, products);

      return {
        success: true,
        message: 'Menu seeded successfully',
        data: {
          merchantId,
          categories: categories.length,
          products: products.length,
          toppings: toppings.length,
          optionGroups: 5,
        },
      };
    } catch (error) {
      console.error('[Seed] Error:', error);
      throw new HttpException(
        error.message || 'Failed to seed menu',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Dev endpoint - no auth required
  @Post('menu/dev')
  async seedMenuDev(@Body() body: { userId: string; email: string }) {
    try {
      const { userId, email } = body;

      if (!userId || !email) {
        throw new HttpException('userId and email are required', HttpStatus.BAD_REQUEST);
      }

      console.log('[Seed] Starting menu seeding for user:', userId, email);

      // Step 1: Get or create merchant
      let merchant = await this.merchantsService.findByOwnerUserId(userId);
      if (!merchant) {
        console.log('[Seed] Creating merchant...');
        merchant = await this.merchantsService.create({
          owner_user_id: userId,
          email: email,
          name: 'Coffee House - The Original',
          phone: '0901234567',
          approval_status: 'approved' as any,
          onboarding_step: 5,
        });
      }

      console.log('[Seed] Merchant found:', merchant._id);
      const merchantId = merchant._id.toString();

      // Step 2: Create Categories
      const categories = await this.createCategories(merchantId);

      // Step 3: Create Toppings
      const toppings = await this.createToppings(merchantId);

      // Step 4: Create Products
      const products = await this.createProducts(merchantId, categories);

      // Step 5: Create Option Groups
      await this.createOptionGroups(merchantId, products);

      return {
        success: true,
        message: 'Menu seeded successfully (dev mode)',
        data: {
          merchantId,
          categories: categories.length,
          products: products.length,
          toppings: toppings.length,
          optionGroups: 5,
        },
      };
    } catch (error) {
      console.error('[Seed] Error:', error);
      throw new HttpException(
        error.message || 'Failed to seed menu',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async createCategories(merchantId: string) {
    const categoriesData = [
      {
        name: 'Đồ uống nóng',
        description: 'Các loại cà phê và đồ uống nóng nóng hổi',
        image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
        display_order: 1,
        is_active: true,
      },
      {
        name: 'Đồ uống đá',
        description: 'Cà phê đá, trà đá, sinh tố mát lạnh',
        image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500',
        display_order: 2,
        is_active: true,
      },
      {
        name: 'Bánh ngọt',
        description: 'Cake, cookie, bánh ngọt chiều',
        image_url: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=500',
        display_order: 3,
        is_active: true,
      },
      {
        name: 'Đồ ăn vặt',
        description: 'Snack, đồ ăn nhanh nhẹ nhàng',
        image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500',
        display_order: 4,
        is_active: true,
      },
      {
        name: 'Combo tiết kiệm',
        description: 'Combo đồ uống + bánh giá ưu đãi',
        image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500',
        display_order: 5,
        is_active: true,
      },
    ];

    const categories: any[] = [];
    for (const cat of categoriesData) {
      const category = await this.categoriesService.create(merchantId, cat);
      categories.push(category);
      console.log(`[Seed] Created category: ${category.name}`);
    }

    return categories;
  }

  private async createToppings(merchantId: string) {
    const { Types } = require('mongoose');
    const toppingsData = [
      {
        merchant_id: new Types.ObjectId(merchantId),
        name: 'Thêm shot espresso',
        description: 'Thêm 1 shot cà phê đậm đặc',
        price: 10000,
        image_url: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=300',
        is_available: true,
        is_active: true,
        display_order: 1,
      },
      {
        merchant_id: new Types.ObjectId(merchantId),
        name: 'Sữa đặc',
        description: 'Thêm sữa đặc ngọt ngào',
        price: 5000,
        image_url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300',
        is_available: true,
        is_active: true,
        display_order: 2,
      },
      {
        merchant_id: new Types.ObjectId(merchantId),
        name: 'Whipped cream',
        description: 'Kem bông xốp thơm ngon',
        price: 8000,
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300',
        is_available: true,
        is_active: true,
        display_order: 3,
      },
      {
        merchant_id: new Types.ObjectId(merchantId),
        name: 'Trân châu đen',
        description: 'Trân châu đen dai ngon',
        price: 6000,
        image_url: 'https://images.unsplash.com/photo-1558188697-0a18f298b448?w=300',
        is_available: true,
        is_active: true,
        display_order: 4,
      },
      {
        merchant_id: new Types.ObjectId(merchantId),
        name: 'Sốt caramel',
        description: 'Sốt caramel béo ngậy',
        price: 5000,
        image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300',
        is_available: true,
        is_active: true,
        display_order: 5,
      },
    ];

    const toppings: any[] = [];
    for (const top of toppingsData) {
      const topping = await this.toppingsService.create(top);
      toppings.push(topping);
      console.log(`[Seed] Created topping: ${topping.name} (${topping.price}đ)`);
    }

    return toppings;
  }

  private async createProducts(merchantId: string, categories: any[]) {
    const productsData = [
      {
        category_id: categories[0]._id.toString(),
        name: 'Cà phê Sữa Đá',
        description: 'Cà phê đậm đặc pha với sữa đặc truyền thống',
        price: 25000,
        original_price: 30000,
        image_urls: ['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500'],
        base_price: 25000,
        is_available: true,
        display_order: 1,
        prep_time_min: 5,
      },
      {
        category_id: categories[0]._id.toString(),
        name: 'Cappuccino Nóng',
        description: 'Espresso + sữa nóng + bọt kem bông xốp',
        price: 35000,
        image_urls: ['https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500'],
        base_price: 35000,
        is_available: true,
        display_order: 2,
        prep_time_min: 7,
      },
      {
        category_id: categories[1]._id.toString(),
        name: 'Sinh Tố Bơ',
        description: 'Bơ sáp xay mịn với sữa tươi đặc biệt',
        price: 45000,
        image_urls: ['https://images.unsplash.com/photo-1600506777873-74d14e788519?w=500'],
        base_price: 45000,
        is_available: true,
        display_order: 1,
        prep_time_min: 8,
      },
      {
        category_id: categories[1]._id.toString(),
        name: 'Trà Đào Cam Sả',
        description: 'Trà thanh mát + đào tươi + cam sả thơm',
        price: 40000,
        image_urls: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500'],
        base_price: 40000,
        is_available: true,
        display_order: 2,
        prep_time_min: 5,
      },
      {
        category_id: categories[2]._id.toString(),
        name: 'Croissant Bơ',
        description: 'Croissant Pháp bơ thượng hạng, nướng giòn',
        price: 25000,
        image_urls: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500'],
        base_price: 25000,
        is_available: true,
        display_order: 1,
        prep_time_min: 3,
      },
      {
        category_id: categories[2]._id.toString(),
        name: 'Tiramisu',
        description: 'Bánh Tiramisu Ý với mascarpone đậm đà',
        price: 55000,
        image_urls: ['https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500'],
        base_price: 55000,
        is_available: true,
        display_order: 2,
        prep_time_min: 5,
      },
      {
        category_id: categories[3]._id.toString(),
        name: 'French Fries',
        description: 'Khoai tây chiên giòn với sốt ướp đặc biệt',
        price: 35000,
        image_urls: ['https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500'],
        base_price: 35000,
        is_available: true,
        display_order: 1,
        prep_time_min: 8,
      },
      {
        category_id: categories[3]._id.toString(),
        name: 'Sandwich Cá Ngừ',
        description: 'Bánh mì mềm + cá ngừ + rau củ tươi',
        price: 45000,
        image_urls: ['https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500'],
        base_price: 45000,
        is_available: true,
        display_order: 2,
        prep_time_min: 6,
      },
      {
        category_id: categories[4]._id.toString(),
        name: 'Combo 1: Cà phê + Croissant',
        description: 'Cà phê Sữa Đá + Croissant Bơ',
        price: 42000,
        original_price: 50000,
        image_urls: [
          'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500',
          'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500',
        ],
        base_price: 42000,
        is_available: true,
        display_order: 1,
        prep_time_min: 8,
      },
      {
        category_id: categories[4]._id.toString(),
        name: 'Combo 2: Trà + Tiramisu',
        description: 'Trà Đào Cam Sả + Tiramisu',
        price: 85000,
        original_price: 95000,
        image_urls: [
          'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500',
          'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500',
        ],
        base_price: 85000,
        is_available: true,
        display_order: 2,
        prep_time_min: 10,
      },
    ];

    const products: any[] = [];
    for (const prod of productsData) {
      const product = await this.productsService.create(merchantId, prod as any);
      products.push(product);
      console.log(`[Seed] Created product: ${product.name} (${(product as any).price}đ)`);
    }

    return products;
  }

  private async createOptionGroups(merchantId: string, products: any[]) {
    // Option group for Cà phê Sữa Đá (Size)
    const og1 = await this.productOptionsService.createGroup(merchantId, products[0]._id.toString(), {
      name: 'Size',
      type: 'single',
      min_required: 1,
      max_allowed: 1,
      display_order: 1,
    } as any);
    await this.productOptionsService.addChoice(merchantId, og1._id.toString(), { name: 'Size M', price_adjustment: 0, is_default: true, is_available: true, display_order: 1 });
    await this.productOptionsService.addChoice(merchantId, og1._id.toString(), { name: 'Size L', price_adjustment: 5000, is_default: false, is_available: true, display_order: 2 });
    console.log('[Seed] Created option group: Size for Cà phê Sữa Đá');

    // Option group for Cà phê Sữa Đá (Độ ngọt)
    const og2 = await this.productOptionsService.createGroup(merchantId, products[0]._id.toString(), {
      name: 'Độ ngọt',
      type: 'single',
      min_required: 1,
      max_allowed: 1,
      display_order: 2,
    } as any);
    await this.productOptionsService.addChoice(merchantId, og2._id.toString(), { name: '100%', price_adjustment: 0, is_default: true, is_available: true, display_order: 1 });
    await this.productOptionsService.addChoice(merchantId, og2._id.toString(), { name: '70%', price_adjustment: 0, is_default: false, is_available: true, display_order: 2 });
    await this.productOptionsService.addChoice(merchantId, og2._id.toString(), { name: '50%', price_adjustment: 0, is_default: false, is_available: true, display_order: 3 });
    console.log('[Seed] Created option group: Độ ngọt for Cà phê Sữa Đá');

    // Option group for Sinh Tố Bơ (Topping)
    const og3 = await this.productOptionsService.createGroup(merchantId, products[2]._id.toString(), {
      name: 'Topping',
      type: 'multiple',
      min_required: 0,
      max_allowed: 3,
      display_order: 1,
    } as any);
    await this.productOptionsService.addChoice(merchantId, og3._id.toString(), { name: 'Trân châu đen', price_adjustment: 6000, is_default: false, is_available: true, display_order: 1 });
    await this.productOptionsService.addChoice(merchantId, og3._id.toString(), { name: 'Whipped cream', price_adjustment: 8000, is_default: false, is_available: true, display_order: 2 });
    await this.productOptionsService.addChoice(merchantId, og3._id.toString(), { name: 'Sốt caramel', price_adjustment: 5000, is_default: false, is_available: true, display_order: 3 });
    console.log('[Seed] Created option group: Topping for Sinh Tố Bơ');

    // Option group for Croissant Bơ (Thêm kèm)
    const og4 = await this.productOptionsService.createGroup(merchantId, products[4]._id.toString(), {
      name: 'Thêm kèm',
      type: 'multiple',
      min_required: 0,
      max_allowed: 2,
      display_order: 1,
    } as any);
    await this.productOptionsService.addChoice(merchantId, og4._id.toString(), { name: 'Thêm bơ', price_adjustment: 3000, is_default: false, is_available: true, display_order: 1 });
    await this.productOptionsService.addChoice(merchantId, og4._id.toString(), { name: 'Thêm mứt dâu', price_adjustment: 5000, is_default: false, is_available: true, display_order: 2 });
    console.log('[Seed] Created option group: Thêm kèm for Croissant Bơ');

    // Option group for Trà Đào Cam Sả (Độ lạnh)
    const og5 = await this.productOptionsService.createGroup(merchantId, products[3]._id.toString(), {
      name: 'Độ lạnh',
      type: 'single',
      min_required: 1,
      max_allowed: 1,
      display_order: 1,
    } as any);
    await this.productOptionsService.addChoice(merchantId, og5._id.toString(), { name: 'Đá đầy', price_adjustment: 0, is_default: true, is_available: true, display_order: 1 });
    await this.productOptionsService.addChoice(merchantId, og5._id.toString(), { name: 'Ít đá', price_adjustment: 0, is_default: false, is_available: true, display_order: 2 });
    await this.productOptionsService.addChoice(merchantId, og5._id.toString(), { name: 'Nóng', price_adjustment: 0, is_default: false, is_available: true, display_order: 3 });
    console.log('[Seed] Created option group: Độ lạnh for Trà Đào Cam Sả');
  }
}
