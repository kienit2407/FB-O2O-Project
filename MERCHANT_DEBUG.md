# Merchant API Debug Guide

## Problem
Khi gọi các route của merchant (categories, products, toppings, product-options), bị lỗi 403 Forbidden: "Merchant not found for this user"

## Root Cause
1. **CurrentUser decorator** thiếu property `sub` - đã fix ✓
2. **User chưa có merchant record** trong database

## Solution

### 1. Đã sửa `CurrentUser` decorator
File: `apps/api/src/modules/auth/decorators/current-user.decorator`
- Đã thêm `sub` vào interface và return object
- Bây giờ decorator sẽ trả về cả `sub` và `userId`

### 2. Tạo merchant cho user đang đăng nhập
Đã thêm endpoint debug: `POST /merchant/menu/categories/debug/create-merchant`

#### Cách 1: Sử dụng curl
```bash
# Thay YOUR_JWT_TOKEN với token thực tế của bạn
curl -X POST "http://localhost:4000/merchant/menu/categories/debug/create-merchant" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Cách 2: Sử dụng Postman/Insomnia
```
POST http://localhost:4000/merchant/menu/categories/debug/create-merchant
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
```

### 3. Test lại các endpoint sau khi có merchant

Sau khi đã có merchant record, bạn có thể test:
- `GET /merchant/menu/categories?includeInactive=1`
- `GET /merchant/menu/products`
- `GET /merchant/menu/toppings`
- `GET /merchant/menu/products/:productId/options`

## Script Test Automation

Đã tạo script test tại `scripts/test-merchant-api.sh`

Sửa JWT_TOKEN trong script và chạy:
```bash
chmod +x scripts/test-merchant-api.sh
./scripts/test-merchant-api.sh
```

## Debugging

Nếu vẫn gặp lỗi, kiểm tra server logs:
- Log sẽ hiển thị khi tìm merchant
- Kiểm tra xem user có merchant record chưa

## Next Steps

Sau khi đã có merchant và test thành công:
1. Xóa endpoint debug `/debug/create-merchant`
2. Thêm logic để tự tạo merchant khi user đăng ký lần đầu (nếu cần)
3. Xóa các log debug trong MerchantsService
