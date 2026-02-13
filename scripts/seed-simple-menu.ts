/**
 * Script seeding dữ liệu merchant menu đơn giản
 * Sử dụng MongoDB client trực tiếp
 */

import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'fab-o2o';

async function seedMenuData() {
  const userId = process.argv[2];
  const userEmail = process.argv[3];

  if (!userId || !userEmail) {
    console.error('Usage: npx ts-node scripts/seed-simple-menu.ts <user_id> <email>');
    process.exit(1);
  }

  console.log('========================================');
  console.log('Seeding Merchant Menu Data');
  console.log('========================================');
  console.log(`User ID: ${userId}`);
  console.log(`User Email: ${userEmail}`);
  console.log('');

  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    // Step 1: Get or create merchant
    console.log('Step 1: Getting/Creating merchant...');
    let merchant = await db.collection('merchants').findOne({
      owner_user_id: new ObjectId(userId),
      deleted_at: null,
    });

    if (!merchant) {
      console.log('Creating new merchant...');
      merchant = await db.collection('merchants').insertOne({
        owner_user_id: new ObjectId(userId),
        email: userEmail,
        name: 'Coffee House - The Original',
        phone: '0901234567',
        approval_status: 'approved',
        onboarding_step: 5,
        is_accepting_orders: true,
        category: 'coffee',
        logo_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
        cover_image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200',
        created_at: new Date(),
        updated_at: new Date(),
      }).then((result: any) => db.collection('merchants').findOne({ _id: result.insertedId }));
    }
    console.log(`✅ Merchant ID: ${merchant._id}\n`);

    const merchantId = merchant._id;

    // Step 2: Create Categories
    console.log('Step 2: Creating categories...');
    const categoriesData = [
      {
        merchant_id: merchantId,
        name: 'Đồ uống nóng',
        description: 'Các loại cà phê và đồ uống nóng nóng hổi',
        image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
        display_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        name: 'Đồ uống đá',
        description: 'Cà phê đá, trà đá, sinh tố mát lạnh',
        image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500',
        display_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        name: 'Bánh ngọt',
        description: 'Cake, cookie, bánh ngọt chiều',
        image_url: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=500',
        display_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        name: 'Đồ ăn vặt',
        description: 'Snack, đồ ăn nhanh nhẹ nhàng',
        image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500',
        display_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        name: 'Combo tiết kiệm',
        description: 'Combo đồ uống + bánh giá ưu đãi',
        image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500',
        display_order: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    const categoryIds: ObjectId[] = [];
    for (const cat of categoriesData) {
      const result = await db.collection('categories').insertOne(cat);
      categoryIds.push(result.insertedId);
      console.log(`  ✅ Created category: ${cat.name} (ID: ${result.insertedId})`);
    }

    // Step 3: Create Toppings
    console.log('\nStep 3: Creating toppings...');
    const toppingsData = [
      {
        merchant_id: merchantId,
        name: 'Thêm shot espresso',
        description: 'Thêm 1 shot cà phê đậm đặc',
        price: 10000,
        image_url: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=300',
        is_available: true,
        is_active: true,
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        name: 'Sữa đặc',
        description: 'Thêm sữa đặc ngọt ngào',
        price: 5000,
        image_url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300',
        is_available: true,
        is_active: true,
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        name: 'Whipped cream',
        description: 'Kem bông xốp thơm ngon',
        price: 8000,
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300',
        is_available: true,
        is_active: true,
        display_order: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        name: 'Trân châu đen',
        description: 'Trân châu đen dai ngon',
        price: 6000,
        image_url: 'https://images.unsplash.com/photo-1558188697-0a18f298b448?w=300',
        is_available: true,
        is_active: true,
        display_order: 4,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        name: 'Sốt caramel',
        description: 'Sốt caramel béo ngậy',
        price: 5000,
        image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300',
        is_available: true,
        is_active: true,
        display_order: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    const toppingIds: ObjectId[] = [];
    for (const top of toppingsData) {
      const result = await db.collection('toppings').insertOne(top);
      toppingIds.push(result.insertedId);
      console.log(`  ✅ Created topping: ${top.name} (Price: ${top.price}đ)`);
    }

    // Step 4: Create Products
    console.log('\nStep 4: Creating products...');
    const productsData = [
      {
        merchant_id: merchantId,
        category_id: categoryIds[0],
        name: 'Cà phê Sữa Đá',
        description: 'Cà phê đậm đặc pha với sữa đặc truyền thống',
        price: 25000,
        original_price: 30000,
        image_urls: ['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500'],
        base_price: 25000,
        is_available: true,
        is_deleted: false,
        display_order: 1,
        prep_time_min: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        category_id: categoryIds[0],
        name: 'Cappuccino Nóng',
        description: 'Espresso + sữa nóng + bọt kem bông xốp',
        price: 35000,
        image_urls: ['https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500'],
        base_price: 35000,
        is_available: true,
        is_deleted: false,
        display_order: 2,
        prep_time_min: 7,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        category_id: categoryIds[1],
        name: 'Sinh Tố Bơ',
        description: 'Bơ sáp xay mịn với sữa tươi đặc biệt',
        price: 45000,
        image_urls: ['https://images.unsplash.com/photo-1600506777873-74d14e788519?w=500'],
        base_price: 45000,
        is_available: true,
        is_deleted: false,
        display_order: 1,
        prep_time_min: 8,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        category_id: categoryIds[1],
        name: 'Trà Đào Cam Sả',
        description: 'Trà thanh mát + đào tươi + cam sả thơm',
        price: 40000,
        image_urls: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500'],
        base_price: 40000,
        is_available: true,
        is_deleted: false,
        display_order: 2,
        prep_time_min: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        category_id: categoryIds[2],
        name: 'Croissant Bơ',
        description: 'Croissant Pháp bơ thượng hạng, nướng giòn',
        price: 25000,
        image_urls: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500'],
        base_price: 25000,
        is_available: true,
        is_deleted: false,
        display_order: 1,
        prep_time_min: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        category_id: categoryIds[2],
        name: 'Tiramisu',
        description: 'Bánh Tiramisu Ý với mascarpone đậm đà',
        price: 55000,
        image_urls: ['https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500'],
        base_price: 55000,
        is_available: true,
        is_deleted: false,
        display_order: 2,
        prep_time_min: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        category_id: categoryIds[3],
        name: 'French Fries',
        description: 'Khoai tây chiên giòn với sốt ướp đặc biệt',
        price: 35000,
        image_urls: ['https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500'],
        base_price: 35000,
        is_available: true,
        is_deleted: false,
        display_order: 1,
        prep_time_min: 8,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        category_id: categoryIds[3],
        name: 'Sandwich Cá Ngừ',
        description: 'Bánh mì mềm + cá ngừ + rau củ tươi',
        price: 45000,
        image_urls: ['https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500'],
        base_price: 45000,
        is_available: true,
        is_deleted: false,
        display_order: 2,
        prep_time_min: 6,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        category_id: categoryIds[4],
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
        is_deleted: false,
        display_order: 1,
        prep_time_min: 8,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        merchant_id: merchantId,
        category_id: categoryIds[4],
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
        is_deleted: false,
        display_order: 2,
        prep_time_min: 10,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    const productIds: ObjectId[] = [];
    for (const prod of productsData) {
      const result = await db.collection('products').insertOne(prod);
      productIds.push(result.insertedId);
      console.log(`  ✅ Created product: ${prod.name} (${prod.price}đ)`);
    }

    // Step 5: Create Option Groups for products
    console.log('\nStep 5: Creating option groups...');

    // Create option group for Cà phê Sữa Đá (Size)
    const optionGroup1Result = await db.collection('product_option_groups').insertOne({
      merchant_id: merchantId,
      product_id: productIds[0],
      name: 'Size',
      type: 'single',
      min_required: 1,
      max_allowed: 1,
      display_order: 1,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
    });
    const choices1Data = [
      { option_group_id: optionGroup1Result.insertedId, name: 'Size M', price_adjustment: 0, is_default: true, is_available: true, display_order: 1, created_at: new Date(), updated_at: new Date() },
      { option_group_id: optionGroup1Result.insertedId, name: 'Size L', price_adjustment: 5000, is_default: false, is_available: true, display_order: 2, created_at: new Date(), updated_at: new Date() },
    ];
    for (const choice of choices1Data) {
      await db.collection('choices').insertOne(choice);
    }
    console.log(`  ✅ Created option group "Size" for product #${productIds[0].toString().slice(-6)} (2 choices)`);

    // Create option group for Cà phê Sữa Đá (Độ ngọt)
    const optionGroup2Result = await db.collection('product_option_groups').insertOne({
      merchant_id: merchantId,
      product_id: productIds[0],
      name: 'Độ ngọt',
      type: 'single',
      min_required: 1,
      max_allowed: 1,
      display_order: 2,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
    });
    const choices2Data = [
      { option_group_id: optionGroup2Result.insertedId, name: '100%', price_adjustment: 0, is_default: true, is_available: true, display_order: 1, created_at: new Date(), updated_at: new Date() },
      { option_group_id: optionGroup2Result.insertedId, name: '70%', price_adjustment: 0, is_default: false, is_available: true, display_order: 2, created_at: new Date(), updated_at: new Date() },
      { option_group_id: optionGroup2Result.insertedId, name: '50%', price_adjustment: 0, is_default: false, is_available: true, display_order: 3, created_at: new Date(), updated_at: new Date() },
    ];
    for (const choice of choices2Data) {
      await db.collection('choices').insertOne(choice);
    }
    console.log(`  ✅ Created option group "Độ ngọt" for product #${productIds[0].toString().slice(-6)} (3 choices)`);

    // Create option group for Sinh Tố Bơ (Topping)
    const optionGroup3Result = await db.collection('product_option_groups').insertOne({
      merchant_id: merchantId,
      product_id: productIds[2],
      name: 'Topping',
      type: 'multiple',
      min_required: 0,
      max_allowed: 3,
      display_order: 1,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
    });
    const choices3Data = [
      { option_group_id: optionGroup3Result.insertedId, name: 'Trân châu đen', price_adjustment: 6000, is_default: false, is_available: true, display_order: 1, created_at: new Date(), updated_at: new Date() },
      { option_group_id: optionGroup3Result.insertedId, name: 'Whipped cream', price_adjustment: 8000, is_default: false, is_available: true, display_order: 2, created_at: new Date(), updated_at: new Date() },
      { option_group_id: optionGroup3Result.insertedId, name: 'Sốt caramel', price_adjustment: 5000, is_default: false, is_available: true, display_order: 3, created_at: new Date(), updated_at: new Date() },
    ];
    for (const choice of choices3Data) {
      await db.collection('choices').insertOne(choice);
    }
    console.log(`  ✅ Created option group "Topping" for product #${productIds[2].toString().slice(-6)} (3 choices)`);

    // Create option group for Croissant Bơ (Thêm kèm)
    const optionGroup4Result = await db.collection('product_option_groups').insertOne({
      merchant_id: merchantId,
      product_id: productIds[4],
      name: 'Thêm kèm',
      type: 'multiple',
      min_required: 0,
      max_allowed: 2,
      display_order: 1,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
    });
    const choices4Data = [
      { option_group_id: optionGroup4Result.insertedId, name: 'Thêm bơ', price_adjustment: 3000, is_default: false, is_available: true, display_order: 1, created_at: new Date(), updated_at: new Date() },
      { option_group_id: optionGroup4Result.insertedId, name: 'Thêm mứt dâu', price_adjustment: 5000, is_default: false, is_available: true, display_order: 2, created_at: new Date(), updated_at: new Date() },
    ];
    for (const choice of choices4Data) {
      await db.collection('choices').insertOne(choice);
    }
    console.log(`  ✅ Created option group "Thêm kèm" for product #${productIds[4].toString().slice(-6)} (2 choices)`);

    // Create option group for Trà Đào Cam Sả (Độ lạnh)
    const optionGroup5Result = await db.collection('product_option_groups').insertOne({
      merchant_id: merchantId,
      product_id: productIds[3],
      name: 'Độ lạnh',
      type: 'single',
      min_required: 1,
      max_allowed: 1,
      display_order: 1,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
    });
    const choices5Data = [
      { option_group_id: optionGroup5Result.insertedId, name: 'Đá đầy', price_adjustment: 0, is_default: true, is_available: true, display_order: 1, created_at: new Date(), updated_at: new Date() },
      { option_group_id: optionGroup5Result.insertedId, name: 'Ít đá', price_adjustment: 0, is_default: false, is_available: true, display_order: 2, created_at: new Date(), updated_at: new Date() },
      { option_group_id: optionGroup5Result.insertedId, name: 'Nóng', price_adjustment: 0, is_default: false, is_available: true, display_order: 3, created_at: new Date(), updated_at: new Date() },
    ];
    for (const choice of choices5Data) {
      await db.collection('choices').insertOne(choice);
    }
    console.log(`  ✅ Created option group "Độ lạnh" for product #${productIds[3].toString().slice(-6)} (3 choices)`);

    // Summary
    console.log('\n========================================');
    console.log('✅ Seeding completed successfully!');
    console.log('========================================');
    console.log(`Merchant ID: ${merchantId}`);
    console.log(`Categories: ${categoryIds.length}`);
    console.log(`Products: ${productIds.length}`);
    console.log(`Toppings: ${toppingIds.length}`);
    console.log(`Option Groups: 5`);
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedMenuData();
