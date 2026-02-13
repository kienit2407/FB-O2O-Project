# 🎉 Seeding Merchant Menu Data - Hoàn tất!

## ✅ Đã tạo xong tất cả scripts và dữ liệu

### 📁 Danh sách files

#### Scripts Seeding
| File | Mô tả |
|------|-------|
| `scripts/seed-merchant-menu.ts` | Script TypeScript chính để seeding data |
| `scripts/seed-merchant-menu.sh` | Bash helper để chạy seeding nhanh |
| `scripts/seed-menu-data.json` | Dữ liệu mẫu format JSON (để tham khảo) |
| `scripts/create-merchant.sh` | Script tạo merchant cho user |
| `scripts/create-merchant-for-user.ts` | Script TypeScript tạo merchant |
| `scripts/test-seeded-menu.sh` | Script test API sau khi seeding |

#### Documentation
| File | Mô tả |
|------|-------|
| `SEED_QUICK_START.md` | Hướng dẫn nhanh (bắt buộc đọc!) |
| `scripts/SEED_MENU_README.md` | Hướng dẫn chi tiết về seeding |
| `MERCHANT_DEBUG.md` | Hướng dẫn debug auth merchant |

#### Updated Files
| File | Thay đổi |
|------|----------|
| `apps/api/package.json` | Thêm command `seed:menu` |
| `apps/api/src/auth/decorators/current-user.decorator.ts` | Thêm `sub` property |
| `apps/api/src/modules/merchants/services/merchants.service.ts` | Thêm debug logs |

---

## 🚀 CÁCH CHẠY (QUAN TRỌNG!)

### Cách 1: Dùng Bash Script (Khuyên dùng)

```bash
# Bước 1: Tạo merchant
./scripts/create-merchant.sh "YOUR_JWT_TOKEN"

# Bước 2: Seed menu data
./scripts/seed-merchant-menu.sh "698d3ca5001a035ba0dce744" "votrungkien240705@gmail.com"

# Bước 3: Test API
./scripts/test-seeded-menu.sh "YOUR_JWT_TOKEN"
```

### Cách 2: Dùng NPM Command

```bash
cd apps/api
npm run seed:menu "698d3ca5001a035ba0dce744" "votrungkien240705@gmail.com"
```

### Cách 3: Dùng TypeScript trực tiếp

```bash
npx ts-node scripts/seed-merchant-menu.ts "698d3ca5001a035ba0dce744" "votrungkien240705@gmail.com"
```

---

## 📊 Dữ liệu sẽ được tạo

```
✅ 1 Merchant (Coffee House - The Original)
✅ 5 Categories
✅ 10 Products
   ├─ 2 Đồ uống nóng
   ├─ 2 Đồ uống đá
   ├─ 2 Bánh ngọt
   ├─ 2 Đồ ăn vặt
   └─ 2 Combo
✅ 5 Toppings
✅ 5 Option Groups với choices
```

---

## 🎯 Dữ liệu chi tiết

### Categories (5 items)
1. **Đồ uống nóng** - Cà phê và đồ uống nóng nóng hổi
2. **Đồ uống đá** - Cà phê đá, trà đá, sinh tố mát lạnh
3. **Bánh ngọt** - Cake, cookie, bánh ngọt chiều
4. **Đồ ăn vặt** - Snack, đồ ăn nhanh nhẹ nhàng
5. **Combo tiết kiệm** - Combo đồ uống + bánh giá ưu đãi

### Products (10 items)

| # | Tên | Giá | Category |
|---|------|-----|----------|
| 1 | Cà phê Sữa Đá | 25.000đ | Đồ uống nóng |
| 2 | Cappuccino Nóng | 35.000đ | Đồ uống nóng |
| 3 | Sinh Tố Bơ | 45.000đ | Đồ uống đá |
| 4 | Trà Đào Cam Sả | 40.000đ | Đồ uống đá |
| 5 | Croissant Bơ | 25.000đ | Bánh ngọt |
| 6 | Tiramisu | 55.000đ | Bánh ngọt |
| 7 | French Fries | 35.000đ | Đồ ăn vặt |
| 8 | Sandwich Cá Ngừ | 45.000đ | Đồ ăn vặt |
| 9 | Combo 1: Cà phê + Croissant | 42.000đ *(giảm từ 50k)* | Combo |
| 10 | Combo 2: Trà + Tiramisu | 85.000đ *(giảm từ 95k)* | Combo |

### Toppings (5 items)
| Tên | Giá |
|-----|------|
| Thêm shot espresso | 10.000đ |
| Sữa đặc | 5.000đ |
| Whipped cream | 8.000đ |
| Trân châu đen | 6.000đ |
| Sốt caramel | 5.000đ |

### Option Groups (5 groups)

#### Cà phê Sữa Đá
- **Size**: M (mặc định), L (+5k)
- **Độ ngọt**: 100% (mặc định), 70%, 50%

#### Sinh Tố Bơ
- **Topping** (multi): Trân châu (+6k), Whipped cream (+8k), Sốt caramel (+5k)

#### Croissant Bơ
- **Thêm kèm** (multi): Thêm bơ (+3k), Thêm mứt dâu (+5k)

#### Trà Đào Cam Sả
- **Độ lạnh**: Đá đầy (mặc định), Ít đá, Nóng

---

## 🧪 Test nhanh sau khi seeding

```bash
# Set variables
JWT_TOKEN="your_jwt_token"
BASE_URL="http://localhost:4000"

# Test 1: Get all categories
curl "$BASE_URL/merchant/menu/categories?includeInactive=1" \
  -H "Authorization: Bearer $JWT_TOKEN" | python3 -m json.tool

# Test 2: Get all products
curl "$BASE_URL/merchant/menu/products" \
  -H "Authorization: Bearer $JWT_TOKEN" | python3 -m json.tool

# Test 3: Get all toppings
curl "$BASE_URL/merchant/menu/toppings" \
  -H "Authorization: Bearer $JWT_TOKEN" | python3 -m json.tool

# Test 4: Search products
curl "$BASE_URL/merchant/menu/products?q=cà phê" \
  -H "Authorization: Bearer $JWT_TOKEN" | python3 -m json.tool
```

Hoặc dùng test script:
```bash
./scripts/test-seeded-menu.sh "YOUR_JWT_TOKEN"
```

---

## 🔧 Xử lý lỗi

### Error: "Merchant not found for this user"
**Giải pháp:** Tạo merchant trước
```bash
./scripts/create-merchant.sh "YOUR_JWT_TOKEN"
```

### Error: "Cannot find module"
**Giải pháp:** Cài đặt dependencies
```bash
npm install
```

### Error: "ts-node: command not found"
**Giải pháp:** Sử dụng npx
```bash
npx ts-node scripts/seed-merchant-menu.ts ...
```

### Error: "Cannot connect to MongoDB"
**Giải pháp:** Kiểm tra MongoDB đang chạy
```bash
brew services list | grep mongodb
```

---

## 📖 Tài liệu chi tiết

### Hướng dẫn nhanh (Đọc trước!)
```bash
cat SEED_QUICK_START.md
```

### Hướng dẫn chi tiết
```bash
cat scripts/SEED_MENU_README.md
```

### Debug auth
```bash
cat MERCHANT_DEBUG.md
```

---

## 🔄 Reset và Re-seed

Nếu muốn xóa toàn bộ data và seed lại từ đầu:

```bash
# Connect to MongoDB
mongo --eval "
  use fab-o2o;
  db.categories.deleteMany({});
  db.products.deleteMany({});
  db.toppings.deleteMany({});
  db.product_option_groups.deleteMany({});
  db.choices.deleteMany({});
  db.merchants.deleteMany({});
  print('✅ All collections cleared');
"

# Seed lại
./scripts/seed-merchant-menu.sh "698d3ca5001a035ba0dce744" "votrungkien240705@gmail.com"
```

---

## 🎨 Custom dữ liệu

### Thay đổi tên sản phẩm, giá
Edit file: `scripts/seed-merchant-menu.ts`
```typescript
const productsData = [
  {
    name: 'Tên sản phẩm mới',
    price: 30000,
    // ...
  },
  // ...
];
```

### Thay đổi ảnh
Edit file: `scripts/seed-merchant-menu.ts` hoặc upload lên Cloudinary:
```typescript
image_urls: ['https://your-cloudinary-url.com/image.jpg'],
```

### Thêm sản phẩm mới
Thêm object vào mảng `productsData` trong script.

---

## 📝 Checklist trước khi chạy

- [ ] Server NestJS đang chạy (port 4000)
- [ ] MongoDB đang chạy
- [ ] Đã có JWT token
- [ ] Đã có user_id và email
- [ ] Scripts đã có quyền execute: `chmod +x scripts/*.sh`

---

## 🎉 Sau khi seeding thành công

1. ✅ Test các API endpoints
2. ✅ Tích hợp Frontend
3. ✅ Test flow đặt hàng
4. ✅ Remove debug endpoints
5. �️ Deploy lên production

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra server logs
2. Kiểm tra MongoDB data
3. Tham khảo tài liệu trong `*.md` files
4. Test từng endpoint riêng lẻ

---

**Chúc bạn seeding thành công! 🎊**

Created: 2026-02-13
Status: ✅ Ready to use
