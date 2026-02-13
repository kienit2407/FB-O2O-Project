/**
 * Script seeding dữ liệu thực đơn cho merchant
 * Cấu trúc:
 * - 5 Categories: Đồ uống nóng, Đồ uống đá, Bánh ngọt, Đồ ăn vặt, Combo
 * - 10 Products với images, options, toppings
 * - 5 Toppings
 * - Option groups cho các products
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../apps/api/src/app.module';
import { MerchantsService } from '../apps/api/src/modules/merchants/services/merchants.service';
import { CategoriesService } from '../apps/api/src/modules/merchants/services/categories.service';
import { ProductsService } from '../apps/api/src/modules/merchants/services/products.service';
import { ToppingsService } from '../apps/api/src/modules/merchants/services/toppings.service';
import { ProductOptionsService } from '../apps/api/src/modules/merchants/services/product-options.service';
import { Types } from 'mongoose';

interface SeedingData {
  merchantId: string;
  categories: any[];
  products: any[];
  toppings: any[];
  optionGroups: any[];
}

async function seedMerchantMenu() {
  const app = await NestFactory.create(AppModule);
  const merchantsService = app.get(MerchantsService);
  const categoriesService = app.get(CategoriesService);
  const productsService = app.get(ProductsService);
  const toppingsService = app.get(ToppingsService);
  const productOptionsService = app.get(ProductOptionsService);

  try {
    console.log('========================================');
    console.log('Seeding Merchant Menu Data');
    console.log('========================================\n');

    // Step 1: Get or create merchant
    console.log('Step 1: Getting/Creating merchant...');
    const userId = process.argv[2];
    const userEmail = process.argv[3];

    if (!userId) {
      console.error('Usage: ts-node scripts/seed-merchant-menu.ts <user_id> <email>');
      process.exit(1);
    }

    let merchant = await merchantsService.findByOwnerUserId(userId);
    if (!merchant) {
      console.log('Creating new merchant...');
      merchant = await merchantsService.create({
        owner_user_id: userId,
        email: userEmail,
        name: 'Coffee House - The Original',
        phone: '0901234567',
        approval_status: 'approved' as any,
        onboarding_step: 5,
        is_accepting_orders: true,
      });
    }
    console.log(`✅ Merchant ID: ${merchant._id}\n`);

    const merchantId = merchant._id.toString();

    // Step 2: Create Categories
    console.log('Step 2: Creating categories...');
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
      const category = await categoriesService.create(merchantId, cat);
      categories.push(category);
      console.log(`  ✅ Created category: ${category.name} (ID: ${category._id})`);
    }

    // Step 3: Create Toppings
    console.log('\nStep 3: Creating toppings...');
    const toppingsData = [
      {
        name: 'Thêm shot espresso',
        description: 'Thêm 1 shot cà phê đậm đặc',
        price: 10000,
        image_url: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=300',
        is_available: true,
        is_active: true,
        display_order: 1,
      },
      {
        name: 'Sữa đặc',
        description: 'Thêm sữa đặc ngọt ngào',
        price: 5000,
        image_url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300',
        is_available: true,
        is_active: true,
        display_order: 2,
      },
      {
        name: 'Whipped cream',
        description: 'Kem bông xốp thơm ngon',
        price: 8000,
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300',
        is_available: true,
        is_active: true,
        display_order: 3,
      },
      {
        name: 'Trân châu đen',
        description: 'Trân châu đen dai ngon',
        price: 6000,
        image_url: 'https://images.unsplash.com/photo-1558188697-0a18f298b448?w=300',
        is_available: true,
        is_active: true,
        display_order: 4,
      },
      {
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
      const topping = await toppingsService.create({
        merchant_id: new Types.ObjectId(merchantId),
        ...top,
      });
      toppings.push(topping);
      console.log(`  ✅ Created topping: ${topping.name} (Price: ${topping.price}đ)`);
    }

    // Step 4: Create Products
    console.log('\nStep 4: Creating products...');
    const productsData = [
      // Category 1: Đồ uống nóng
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
      // Category 2: Đồ uống đá
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
      // Category 3: Bánh ngọt
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
      // Category 4: Đồ ăn vặt
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
      // Category 5: Combo
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
      const product = await productsService.create(merchantId, prod as any);
      products.push(product);
      console.log(`  ✅ Created product: ${product.name} (${product.price}đ)`);
    }

    // Step 5: Create Option Groups for products
    console.log('\nStep 5: Creating option groups...');
    const optionGroupsData = [
      {
        product_id: products[0]._id.toString(), // Cà phê Sữa Đá
        name: 'Size',
        type: 'single',
        min_required: 1,
        max_allowed: 1,
        display_order: 1,
        choices: [
          { name: 'Size M', price_adjustment: 0, is_default: true, is_available: true, display_order: 1 },
          { name: 'Size L', price_adjustment: 5000, is_default: false, is_available: true, display_order: 2 },
        ],
      },
      {
        product_id: products[0]._id.toString(), // Cà phê Sữa Đá
        name: 'Độ ngọt',
        type: 'single',
        min_required: 1,
        max_allowed: 1,
        display_order: 2,
        choices: [
          { name: '100%', price_adjustment: 0, is_default: true, is_available: true, display_order: 1 },
          { name: '70%', price_adjustment: 0, is_default: false, is_available: true, display_order: 2 },
          { name: '50%', price_adjustment: 0, is_default: false, is_available: true, display_order: 3 },
        ],
      },
      {
        product_id: products[2]._id.toString(), // Sinh Tố Bơ
        name: 'Topping',
        type: 'multiple',
        min_required: 0,
        max_allowed: 3,
        display_order: 1,
        choices: [
          { name: 'Trân châu đen', price_adjustment: 6000, is_default: false, is_available: true, display_order: 1 },
          { name: 'Whipped cream', price_adjustment: 8000, is_default: false, is_available: true, display_order: 2 },
          { name: 'Sốt caramel', price_adjustment: 5000, is_default: false, is_available: true, display_order: 3 },
        ],
      },
      {
        product_id: products[4]._id.toString(), // Croissant Bơ
        name: 'Thêm kèm',
        type: 'multiple',
        min_required: 0,
        max_allowed: 2,
        display_order: 1,
        choices: [
          { name: 'Thêm bơ', price_adjustment: 3000, is_default: false, is_available: true, display_order: 1 },
          { name: 'Thêm mứt dâu', price_adjustment: 5000, is_default: false, is_available: true, display_order: 2 },
        ],
      },
      {
        product_id: products[3]._id.toString(), // Trà Đào Cam Sả
        name: 'Độ lạnh',
        type: 'single',
        min_required: 1,
        max_allowed: 1,
        display_order: 1,
        choices: [
          { name: 'Đá đầy', price_adjustment: 0, is_default: true, is_available: true, display_order: 1 },
          { name: 'Ít đá', price_adjustment: 0, is_default: false, is_available: true, display_order: 2 },
          { name: 'Nóng', price_adjustment: 0, is_default: false, is_available: true, display_order: 3 },
        ],
      },
    ];

    const optionGroups: any[] = [];
    for (const og of optionGroupsData) {
      const { product_id, choices, ...groupData } = og;
      const optionGroup = await productOptionsService.createGroup(merchantId, product_id, groupData as any);
      for (const choice of choices) {
        await productOptionsService.addChoice(merchantId, optionGroup._id.toString(), choice);
      }
      optionGroups.push(optionGroup);
      console.log(`  ✅ Created option group "${optionGroup.name}" for product #${product_id.slice(-6)} (${choices.length} choices)`);
    }

    // Summary
    console.log('\n========================================');
    console.log('✅ Seeding completed successfully!');
    console.log('========================================');
    console.log(`Merchant ID: ${merchantId}`);
    console.log(`Categories: ${categories.length}`);
    console.log(`Products: ${products.length}`);
    console.log(`Toppings: ${toppings.length}`);
    console.log(`Option Groups: ${optionGroups.length}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

seedMerchantMenu();
