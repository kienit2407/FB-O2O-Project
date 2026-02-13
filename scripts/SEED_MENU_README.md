# Seeding Merchant Menu Data

## Overview
Script này tạo dữ liệu mẫu cho thực đơn merchant bao gồm:
- **5 Categories**: Đồ uống nóng, Đồ uống đá, Bánh ngọt, Đồ ăn vặt, Combo
- **10 Products**: Cà phê, Trà, Sinh tố, Bánh, Sandwich, French Fries, Combo
- **5 Toppings**: Espresso, Sữa đặc, Whipped cream, Trân châu, Sốt caramel
- **5 Option Groups**: Size, Độ ngọt, Topping, Thêm kèm, Độ lạnh

## Dữ liệu mẫu

### Categories
| Name | Description |
|------|-------------|
| Đồ uống nóng | Cà phê và đồ uống nóng nóng hổi |
| Đồ uống đá | Cà phê đá, trà đá, sinh tố mát lạnh |
| Bánh ngọt | Cake, cookie, bánh ngọt chiều |
| Đồ ăn vặt | Snack, đồ ăn nhanh nhẹ nhàng |
| Combo tiết kiệm | Combo đồ uống + bánh giá ưu đãi |

### Products (10 items)

#### Đồ uống nóng
1. **Cà phê Sữa Đá** - 25.000đ (30.000đ gốc)
   - Option: Size (M, L), Độ ngọt (100%, 70%, 50%)

2. **Cappuccino Nóng** - 35.000đ

#### Đồ uống đá
3. **Sinh Tố Bơ** - 45.000đ
   - Option: Topping (Trân châu, Whipped cream, Sốt caramel)

4. **Trà Đào Cam Sả** - 40.000đ
   - Option: Độ lạnh (Đá đầy, Ít đá, Nóng)

#### Bánh ngọt
5. **Croissant Bơ** - 25.000đ
   - Option: Thêm kèm (Thêm bơ, Thêm mứt dâu)

6. **Tiramisu** - 55.000đ

#### Đồ ăn vặt
7. **French Fries** - 35.000đ

8. **Sandwich Cá Ngừ** - 45.000đ

#### Combo
9. **Combo 1: Cà phê + Croissant** - 42.000đ (50.000đ gốc)

10. **Combo 2: Trà + Tiramisu** - 85.000đ (95.000đ gốc)

### Toppings
| Name | Price |
|------|-------|
| Thêm shot espresso | 10.000đ |
| Sữa đặc | 5.000đ |
| Whipped cream | 8.000đ |
| Trân châu đen | 6.000đ |
| Sốt caramel | 5.000đ |

## Cách chạy

### Method 1: Sử dụng Bash script (Recommended)

```bash
# Cấp quyền execute
chmod +x scripts/seed-merchant-menu.sh

# Chạy script với user_id và email
./seed-merchant-menu.sh "698d3ca5001a035ba0dce744" "votrungkien240705@gmail.com"
```

### Method 2: Sử dụng TypeScript trực tiếp

```bash
npx ts-node scripts/seed-merchant-menu.ts "698d3ca5001a035ba0dce744" "votrungkien240705@gmail.com"
```

### Method 3: Từ NestJS

```bash
npm run seed:menu
# (cần thêm command trong package.json)
```

## Output sau khi chạy thành công

```
========================================
Seeding Merchant Menu Data
========================================

Step 1: Getting/Creating merchant...
✅ Merchant ID: 507f1f77bcf86cd799439011

Step 2: Creating categories...
  ✅ Created category: Đồ uống nóng (ID: ...)
  ✅ Created category: Đồ uống đá (ID: ...)
  ✅ Created category: Bánh ngọt (ID: ...)
  ✅ Created category: Đồ ăn vặt (ID: ...)
  ✅ Created category: Combo tiết kiệm (ID: ...)

Step 3: Creating toppings...
  ✅ Created topping: Thêm shot espresso (Price: 10000đ)
  ✅ Created topping: Sữa đặc (Price: 5000đ)
  ✅ Created topping: Whipped cream (Price: 8000đ)
  ✅ Created topping: Trân châu đen (Price: 6000đ)
  ✅ Created topping: Sốt caramel (Price: 5000đ)

Step 4: Creating products...
  ✅ Created product: Cà phê Sữa Đá (25000đ)
  ✅ Created product: Cappuccino Nóng (35000đ)
  ✅ Created product: Sinh Tố Bơ (45000đ)
  ✅ Created product: Trà Đào Cam Sả (40000đ)
  ✅ Created product: Croissant Bơ (25000đ)
  ✅ Created product: Tiramisu (55000đ)
  ✅ Created product: French Fries (35000đ)
  ✅ Created product: Sandwich Cá Ngừ (45000đ)
  ✅ Created product: Combo 1: Cà phê + Croissant (42000đ)
  ✅ Created product: Combo 2: Trà + Tiramisu (85000đ)

Step 5: Creating option groups...
  ✅ Created option group "Size" for product #... (2 choices)
  ✅ Created option group "Độ ngọt" for product #... (3 choices)
  ✅ Created option group "Topping" for product #... (3 choices)
  ✅ Created option group "Thêm kèm" for product #... (2 choices)
  ✅ Created option group "Độ lạnh" for product #... (3 choices)

========================================
✅ Seeding completed successfully!
========================================
Merchant ID: 507f1f77bcf86cd799439011
Categories: 5
Products: 10
Toppings: 5
Option Groups: 5
========================================
```

## Test API sau khi seeding

```bash
# Get all categories
curl http://localhost:4000/merchant/menu/categories?includeInactive=1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get all products
curl http://localhost:4000/merchant/menu/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get products by category
curl "http://localhost:4000/merchant/menu/products?categoryId=CAT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get all toppings
curl http://localhost:4000/merchant/menu/toppings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get product options
curl http://localhost:4000/merchant/menu/products/PRODUCT_ID/options \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Xử lý lỗi

### Error: Merchant not found
Đảm bảo bạn đã tạo merchant cho user trước:
```bash
./scripts/create-merchant.sh "YOUR_JWT_TOKEN"
```

### Error: ts-node not found
```bash
npm install -g ts-node
# hoặc
npx ts-node scripts/seed-merchant-menu.ts ...
```

### Error: Cannot connect to database
Kiểm tra MongoDB đang chạy:
```bash
brew services list | grep mongodb
```

## Tùy chỉnh dữ liệu

Edit file `scripts/seed-merchant-menu.ts` để:
- Thay đổi tên sản phẩm, giá
- Thêm/bớt sản phẩm
- Thay đổi ảnh (sử dụng URL hoặc upload lên Cloudinary)
- Thay đổi cấu trúc option groups

## Lưu ý

- Images đang sử dụng URLs từ Unsplash (public domain)
- Tất cả prices tính bằng VNĐ
- Merchant được tạo với status `approved` để test
- Có thể chạy lại script nhiều lần (sẽ tạo mới)
- Để reset data, xóa collections trong database
