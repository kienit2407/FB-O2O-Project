# 🚀 Quick Start: Seed Merchant Menu Data

## Tóm tắt
Script seeding sẽ tạo dữ liệu mẫu cho thực đơn merchant:
- ✅ 5 Categories
- ✅ 10 Products (với images, options)
- ✅ 5 Toppings
- ✅ 5 Option Groups

## 📝 Cách chạy (3 bước)

### Bước 1: Tạo merchant cho user (nếu chưa có)
```bash
./scripts/create-merchant.sh "YOUR_JWT_TOKEN"
```

### Bước 2: Chạy script seeding
```bash
chmod +x scripts/seed-merchant-menu.sh
./scripts/seed-merchant-menu.sh "698d3ca5001a035ba0dce744" "votrungkien240705@gmail.com"
```

**Hoặc:**
```bash
cd apps/api && npm run seed:menu "698d3ca5001a035ba0dce744" "votrungkien240705@gmail.com"
```

### Bước 3: Test API
```bash
./scripts/test-seeded-menu.sh "YOUR_JWT_TOKEN"
```

## 📋 Dữ liệu sẽ được tạo

### Categories (5)
1. Đồ uống nóng
2. Đồ uống đá
3. Bánh ngọt
4. Đồ ăn vặt
5. Combo tiết kiệm

### Products (10)
| STT | Tên | Giá |
|-----|------|-----|
| 1 | Cà phê Sữa Đá | 25.000đ |
| 2 | Cappuccino Nóng | 35.000đ |
| 3 | Sinh Tố Bơ | 45.000đ |
| 4 | Trà Đào Cam Sả | 40.000đ |
| 5 | Croissant Bơ | 25.000đ |
| 6 | Tiramisu | 55.000đ |
| 7 | French Fries | 35.000đ |
| 8 | Sandwich Cá Ngừ | 45.000đ |
| 9 | Combo 1: Cà phê + Croissant | 42.000đ |
| 10 | Combo 2: Trà + Tiramisu | 85.000đ |

### Toppings (5)
- Thêm shot espresso: 10.000đ
- Sữa đặc: 5.000đ
- Whipped cream: 8.000đ
- Trân châu đen: 6.000đ
- Sốt caramel: 5.000đ

### Option Groups (5)
- **Cà phê Sữa Đá**: Size (M, L), Độ ngọt (100%, 70%, 50%)
- **Sinh Tố Bơ**: Topping (Trân châu, Whipped cream, Sốt caramel)
- **Croissant Bơ**: Thêm kèm (Thêm bơ, Thêm mứt dâu)
- **Trà Đào Cam Sả**: Độ lạnh (Đá đầy, Ít đá, Nóng)

## 🧪 Test API bằng curl

```bash
# Set your JWT token
JWT_TOKEN="your_jwt_token_here"
BASE_URL="http://localhost:4000"

# Get categories
curl "$BASE_URL/merchant/menu/categories?includeInactive=1" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Get products
curl "$BASE_URL/merchant/menu/products" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Get products by category
curl "$BASE_URL/merchant/menu/products?categoryId=CATEGORY_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Search products
curl "$BASE_URL/merchant/menu/products?q=cà phê" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Get toppings
curl "$BASE_URL/merchant/menu/toppings" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Get product options
curl "$BASE_URL/merchant/menu/products/PRODUCT_ID/options" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## 📂 Files được tạo/sửa

```
scripts/
├── seed-merchant-menu.ts       # Script seeding chính
├── seed-merchant-menu.sh        # Bash script helper
├── seed-menu-data.json          # Dữ liệu mẫu (JSON)
├── create-merchant.sh           # Tạo merchant
├── create-merchant-for-user.ts  # Script TS tạo merchant
├── test-seeded-menu.sh          # Test API sau seeding
└── SEED_MENU_README.md          # Hướng dẫn chi tiết

apps/api/
└── package.json                 # Thêm command seed:menu
```

## 🔧 Troubleshooting

### Error: Cannot find module
```bash
npm install
```

### Error: ts-node not found
```bash
npm install -g ts-node
# hoặc dùng npx
npx ts-node scripts/seed-merchant-menu.ts ...
```

### Error: Cannot connect to database
Kiểm tra MongoDB đang chạy:
```bash
brew services list | grep mongodb
# hoặc
mongo --eval "db.version()"
```

### Error: Merchant not found
Tạo merchant trước:
```bash
./scripts/create-merchant.sh "YOUR_JWT_TOKEN"
```

## 📖 Tài liệu chi tiết

Xem `scripts/SEED_MENU_README.md` để biết thêm:
- Cấu trúc dữ liệu chi tiết
- Cách custom dữ liệu
- Hướng dẫn sử dụng Postman/Insomnia
- Lưu ý về images từ Unsplash

## 🔄 Reset data

Để xóa và re-seed từ đầu:

```bash
# Connect to MongoDB
mongo

# Switch to database
use fab-o2o

# Delete collections
db.categories.deleteMany({})
db.products.deleteMany({})
db.toppings.deleteMany({})
db.product_option_groups.deleteMany({})
db.choices.deleteMany({})

# Exit
exit

# Run seeding again
./scripts/seed-merchant-menu.sh "698d3ca5001a035ba0dce744" "votrungkien240705@gmail.com"
```

## 🎯 Next Steps

Sau khi seeding thành công:

1. ✅ Test API với các endpoint
2. ✅ Tích hợp vào Frontend
3. ✅ Tạo thêm dữ liệu thực tế nếu cần
4. ✅ Remove debug endpoints
5. ✅ Add validation cho production

## 💡 Tips

- Tất cả images đang sử dụng URLs từ Unsplash (public domain)
- Có thể upload ảnh thật lên Cloudinary và thay URLs trong script
- Script có thể chạy lại nhiều lần (sẽ tạo mới mỗi lần chạy)
- Để update thay vì tạo mới, cần sửa script để check exist trước

---

**Created with ❤️ by AI Assistant**
