# ✅ HOÀN TẤT! Seeding Merchant Menu Data

## 🎯 Đã tạo xong!

Mình đã tạo thành công toàn bộ scripts và dữ liệu mẫu cho thực đơn merchant.

---

## 📁 Files được tạo/sửa

### 🚀 Scripts để chạy
```
scripts/
├── ✅ seed-merchant-menu.ts       # Script seeding chính (TypeScript)
├── ✅ seed-merchant-menu.sh        # Bash helper (dễ chạy nhất)
├── ✅ seed-menu-data.json          # Dữ liệu mẫu (JSON format)
├── ✅ create-merchant.sh           # Tạo merchant
├── ✅ create-merchant-for-user.ts  # Script TS tạo merchant
└── ✅ test-seeded-menu.sh          # Test API sau khi seeding
```

### 📚 Documentation
```
├── ✅ SEED_README.md               # README chính (đọc cái này!)
├── ✅ SEED_QUICK_START.md          # Hướng dẫn nhanh
└── ✅ scripts/SEED_MENU_README.md  # Hướng dẫn chi tiết
```

### 🔧 Updated Files
```
apps/api/
├── ✅ package.json                 # Thêm command seed:menu
└── src/
    ├── ✅ auth/decorators/current-user.decorator.ts (thêm sub property)
    └── ✅ modules/merchants/
        ├── ✅ services/merchants.service.ts (thêm debug logs)
        └── ✅ controllers/ (đã có 4 controllers)
```

---

## 🚀 CÁCH CHẠY NGAY BÂY GIỜ!

### Cách nhanh nhất (Khuyên dùng):

```bash
# Bước 1: Tạo merchant (nếu chưa có)
./scripts/create-merchant.sh "YOUR_JWT_TOKEN"

# Bước 2: Seed menu data
./scripts/seed-merchant-menu.sh "698d3ca5001a035ba0dce744" "votrungkien240705@gmail.com"

# Bước 3: Test API
./scripts/test-seeded-menu.sh "YOUR_JWT_TOKEN"
```

**Lấy JWT Token:**
1. Login vào app
2. Open Developer Tools → Application → Local Storage
3. Copy access_token

---

## 📊 Dữ liệu sẽ được tạo

```
✅ 1 Merchant
✅ 5 Categories
✅ 10 Products (có images, prices, descriptions)
✅ 5 Toppings
✅ 5 Option Groups với choices
```

### Chi tiết sản phẩm:

| STT | Tên sản phẩm | Giá | Category |
|-----|--------------|-----|----------|
| 1 | Cà phê Sữa Đá | 25.000đ | Đồ uống nóng |
| 2 | Cappuccino Nóng | 35.000đ | Đồ uống nóng |
| 3 | Sinh Tố Bơ | 45.000đ | Đồ uống đá |
| 4 | Trà Đào Cam Sả | 40.000đ | Đồ uống đá |
| 5 | Croissant Bơ | 25.000đ | Bánh ngọt |
| 6 | Tiramisu | 55.000đ | Bánh ngọt |
| 7 | French Fries | 35.000đ | Đồ ăn vặt |
| 8 | Sandwich Cá Ngừ | 45.000đ | Đồ ăn vặt |
| 9 | Combo 1: Cà phê + Croissant | 42.000đ | Combo |
| 10 | Combo 2: Trà + Tiramisu | 85.000đ | Combo |

### Toppings:
- Thêm shot espresso: 10.000đ
- Sữa đặc: 5.000đ
- Whipped cream: 8.000đ
- Trân châu đen: 6.000đ
- Sốt caramel: 5.000đ

---

## 🧪 Test API nhanh

Sau khi seeding thành công, test bằng:

```bash
# Get all categories
curl http://localhost:4000/merchant/menu/categories?includeInactive=1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | python3 -m json.tool

# Get all products
curl http://localhost:4000/merchant/menu/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | python3 -m json.tool

# Get all toppings
curl http://localhost:4000/merchant/menu/toppings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | python3 -m json.tool
```

Hoặc dùng test script:
```bash
./scripts/test-seeded-menu.sh "YOUR_JWT_TOKEN"
```

---

## 📖 Tài liệu

| File | Khi nào đọc? |
|------|--------------|
| `SEED_README.md` | **Đọc đầu tiên!** Tổng quan đầy đủ |
| `SEED_QUICK_START.md` | Hướng dẫn nhanh |
| `scripts/SEED_MENU_README.md` | Hướng dẫn chi tiết |

---

## ⚠️ Lưu ý quan trọng

1. **Images đang dùng URLs từ Unsplash** (public domain) - có thể thay bằng ảnh thật sau
2. **Scripts có thể chạy lại nhiều lần** (mỗi lần sẽ tạo mới)
3. **Merchant được tạo với status approved** để test
4. **Nhớ thay JWT token của bạn** trước khi chạy scripts

---

## 🔄 Nếu gặp lỗi

### Error: "Merchant not found"
```bash
./scripts/create-merchant.sh "YOUR_JWT_TOKEN"
```

### Error: "Cannot find module"
```bash
npm install
```

### Error: "ts-node: command not found"
```bash
npx ts-node scripts/seed-merchant-menu.ts ...
```

### Xóa hết và seed lại
```bash
mongo --eval "use fab-o2o; db.categories.deleteMany({}); db.products.deleteMany({}); db.toppings.deleteMany({}); db.product_option_groups.deleteMany({}); db.choices.deleteMany({});"
```

---

## 🎉 Chúc bạn thành công!

Xem đầy đủ tại: [SEED_README.md](./SEED_README.md)

---

**Created:** 2026-02-13
**Status:** ✅ Ready to use
**Total Records:** 21 (1 merchant + 5 categories + 10 products + 5 toppings + 5 option groups)
