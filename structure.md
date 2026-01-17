# FaB-O2O - PROJECT STRUCTURE OVERVIEW

## 1. PROJECT OVERVIEW

### 1.1 Giới thiệu
**FaB-O2O** là một **Super App** kết hợp 3 dịch vụ chính:

| Dịch vụ | Mô tả |
|---------|-------|
| **Food Delivery** | Đặt đồ ăn giao hàng tận nơi |
| **Ride-hailing** | Gọi xe máy/ô tô (giống Grab) |
| **Dine-in QR** | Đặt món tại quán bằng quét mã QR |

### 1.2 Các ứng dụng

| App | Nền tảng | Đối tượng sử dụng |
|-----|----------|-------------------|
| Customer App | Flutter (iOS/Android) | Khách hàng đặt món, gọi xe |
| Driver App | Flutter (iOS/Android) | Tài xế nhận đơn, giao hàng |
| Merchant Portal | React (Web) | Quản lý quán, menu, đơn hàng |
| Admin Portal | React (Web) | Quản trị hệ thống |

---

## 2. TECHNOLOGY STACK

### 2.1 Core Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Mobile** | Flutter | Customer & Driver apps |
| **Web Frontend** | React + Vite | Admin & Merchant portals |
| **Backend** | NestJS | Microservices API |
| **AI Service** | Python + FastAPI | Recommendation engine |
| **Database** | MongoDB | Primary data storage |
| **Cache** | Redis | Session, caching, rate limiting |
| **Message Queue** | Kafka | Event streaming |
| **Search** | Elasticsearch | Full-text search (optional) |

### 2.2 Third-party Services

| Service | Provider | Purpose |
|---------|----------|---------|
| Push Notification | Firebase (FCM) | Thông báo đẩy mobile |
| Email | Resend | Xác thực, thông báo |
| Media Storage | Cloudinary | Ảnh, video |
| Maps | Track Asia | Bản đồ Flutter |
| Routing | OSRM / GraphHopper | Tính đường đi |
| Payment | VNPay, MoMo, ZaloPay | Thanh toán online |

---

## 3. MONOREPO ARCHITECTURE

```
fab-o2o/
├── apps/
│   ├── api/                      # NestJS Backend
│   ├── web/                      # React Web Portal
│   └── mobile/                   # Flutter Mobile App
│
├── packages/
│   ├── contracts/                # Shared API types + Zod schemas
│   └── tsconfig/                 # Shared TypeScript config
│
├── infra/
│   ├── docker/                   # Dockerfiles, nginx, mongo, redis
│   ├── k8s/                      # Kubernetes manifests
│   └── scripts/                  # Build/deploy/migrate scripts
│
├── docs/
│   ├── adr/                      # Architecture Decision Records
│   └── api/                      # OpenAPI + Postman collection
│
├── .github/                      # CI/CD pipelines
├── .editorconfig
├── .gitignore
├── biome.json                    # Linter/Formatter
└── README.md
```

---

## 4. API ENDPOINTS

### 4.1 Auth & Users
```
POST   /auth/otp/request          # Gửi OTP đến SĐT
POST   /auth/otp/verify           # Xác thực OTP → tokens
POST   /auth/login                # Login email/password (merchant/admin)
POST   /auth/refresh              # Refresh token
POST   /auth/logout               # Logout

GET    /users/me                  # Lấy thông tin user hiện tại
PATCH  /users/me                  # Cập nhật profile
POST   /users/devices             # Upsert FCM token
```

### 4.2 Merchants & Menu
```
GET    /brands                    # Danh sách brands
POST   /brands                    # Tạo brand (admin)

GET    /merchants/nearby          # Tìm quán gần: ?lng=&lat=&radius_km=
GET    /merchants/:id             # Chi tiết merchant
PATCH  /merchants/:id/business-hours  # Cập nhật giờ mở cửa

GET    /merchants/:id/menu        # Lấy menu (template + overrides)

# CRUD Operations
CRUD   /categories                # Quản lý danh mục
CRUD   /products                  # Quản lý sản phẩm
CRUD   /products/:id/options      # Quản lý options
CRUD   /toppings                  # Quản lý toppings
```

### 4.3 Dine-in
```
GET    /tables                    # Danh sách bàn: ?merchant_id=
POST   /table-sessions            # Tạo session (scan QR)
POST   /carts                     # Tạo cart dine-in
POST   /orders                    # Đặt đơn: order_type=dine_in
```

### 4.4 Orders (Delivery)
```
POST   /carts/items               # Thêm/cập nhật item vào cart
POST   /orders                    # Checkout cart → tạo order
PATCH  /orders/:id/status         # Cập nhật trạng thái
GET    /orders                    # Danh sách đơn: ?role=customer|merchant|driver
POST   /orders/:id/rate           # Đánh giá đơn hàng
```

### 4.5 Rides
```
POST   /rides                     # Tạo yêu cầu đặt xe
GET    /rides/:id                 # Chi tiết chuyến đi
PATCH  /rides/:id/status          # Cập nhật trạng thái
POST   /rides/:id/verify-pickup   # Xác nhận đón khách (OTP)
POST   /rides/:id/rate            # Đánh giá chuyến đi
```

### 4.6 Payments & Wallet
```
POST   /payments/init             # Khởi tạo thanh toán
POST   /payments/webhook/:gateway # Webhook từ payment gateway

POST   /withdrawals               # Yêu cầu rút tiền
GET    /wallets/me                # Ví của user
GET    /wallets/me/transactions   # Lịch sử giao dịch
```

### 4.7 Promotions
```
GET    /promotions/featured       # Khuyến mãi nổi bật
POST   /vouchers/validate         # Kiểm tra voucher
POST   /vouchers/apply            # Áp dụng voucher vào cart
GET    /users/me/vouchers         # Voucher của user
```

### 4.8 Chat & Notifications
```
GET    /chat/rooms                # Danh sách phòng chat
GET    /chat/rooms/:id/messages   # Tin nhắn trong phòng
WS     /chat                      # WebSocket realtime chat

GET    /notifications             # Danh sách thông báo
PATCH  /notifications/:id/read    # Đánh dấu đã đọc
```

---

## 5. APPLICATION STRUCTURES

### 5.1 NestJS Backend (`apps/api/`)

```
apps/api/
├── src/
│   ├── main.ts                   # Bootstrap
│   ├── app.module.ts             # Root module
│   │
│   ├── common/                   # Shared utilities
│   │   ├── decorators/           # Custom decorators
│   │   ├── filters/              # Exception filters
│   │   ├── guards/               # Auth guards
│   │   ├── interceptors/         # Logging, transform
│   │   ├── pipes/                # Validation pipes
│   │   └── utils/                # Helper functions
│   │
│   ├── config/                   # Configuration
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── app.config.ts
│   │
│   ├── modules/                  # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/       # Passport strategies
│   │   │   └── dto/
│   │   │
│   │   ├── users/
│   │   ├── merchants/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── rides/
│   │   ├── payments/
│   │   ├── promotions/
│   │   ├── chat/
│   │   └── notifications/
│   │
│   └── database/
│       ├── schemas/              # Mongoose schemas
│       └── seeders/              # Seed data
│
├── test/                         # E2E tests
├── nest-cli.json
├── tsconfig.json
└── package.json
```

### 5.2 React Web Portal (`apps/web/`)

```
apps/web/
├── src/
│   ├── app/
│   │   ├── main.tsx              # Entry point
│   │   ├── routes.tsx            # React Router config
│   │   ├── providers/            # Context providers
│   │   │   ├── QueryProvider.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── AuthProvider.tsx
│   │   └── layout/               # App shell
│   │       ├── AppShell.tsx
│   │       ├── Sidebar.tsx
│   │       └── Header.tsx
│   │
│   ├── shared/
│   │   ├── api/                  # HTTP client, interceptors
│   │   ├── ui/                   # Design system components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── Table/
│   │   ├── hooks/                # Custom hooks
│   │   ├── lib/                  # Utilities
│   │   ├── config/               # Environment config
│   │   └── types/                # TypeScript types
│   │
│   ├── features/                 # Feature modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── api/
│   │   ├── merchant-management/
│   │   ├── order-management/
│   │   ├── promotions/
│   │   └── reports/
│   │
│   ├── entities/                 # Domain entities
│   │   ├── user/
│   │   ├── merchant/
│   │   ├── order/
│   │   └── ride/
│   │
│   ├── pages/                    # Route pages
│   │   ├── LoginPage/
│   │   ├── DashboardPage/
│   │   ├── MerchantsPage/
│   │   └── OrdersPage/
│   │
│   ├── assets/                   # Static assets
│   └── styles/                   # Global styles
│
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### 5.3 Flutter Mobile App (`apps/mobile/`)

```
apps/mobile/
├── lib/
│   ├── main.dart                 # Entry point
│   │
│   ├── app/
│   │   ├── router/               # go_router config
│   │   ├── theme/                # Theme, colors, typography
│   │   └── di/                   # Dependency injection
│   │
│   ├── core/
│   │   ├── network/              # Dio client, interceptors
│   │   ├── storage/              # Secure storage, prefs
│   │   ├── error/                # Error handling
│   │   ├── utils/                # Formatters, helpers
│   │   └── constants/            # App constants
│   │
│   ├── data/                     # Data layer
│   │   ├── datasources/          # Remote/local sources
│   │   ├── models/               # DTOs (freezed)
│   │   └── repositories/         # Repository implementations
│   │
│   ├── domain/                   # Domain layer
│   │   ├── entities/             # Business entities
│   │   ├── repositories/         # Abstract contracts
│   │   └── usecases/             # Business logic
│   │
│   ├── presentation/             # UI layer (MVVM)
│   │   ├── common_widgets/       # Shared widgets
│   │   └── features/
│   │       ├── auth/
│   │       │   ├── view/         # Screens, widgets
│   │       │   ├── viewmodel/    # Riverpod notifiers
│   │       │   └── state/        # State classes
│   │       ├── home/
│   │       ├── merchant_detail/
│   │       ├── cart/
│   │       ├── orders/
│   │       ├── ride/
│   │       └── chat/
│   │
│   └── generated/                # Code generation output
│
├── test/                         # Unit/widget tests
├── android/
├── ios/
└── pubspec.yaml
```

---

## 6. DATABASE COLLECTIONS

### 6.1 Users & Authentication
| Collection | Mô tả |
|------------|-------|
| `users` | Thông tin user (customer, driver, merchant_staff, admin) |
| `otp_codes` | Mã OTP xác thực |
| `user_devices` | FCM tokens cho push notification |
| `customer_profiles` | Profile bổ sung cho customer |
| `driver_profiles` | Profile tài xế (xe, giấy tờ, wallet) |

### 6.2 Merchants & Products
| Collection | Mô tả |
|------------|-------|
| `brands` | Thương hiệu (Highland, Phúc Long...) |
| `merchants` | Chi nhánh/cửa hàng |
| `categories` | Danh mục sản phẩm |
| `products` | Sản phẩm/món ăn |
| `toppings` | Topping cho sản phẩm |
| `menu_templates` | Template menu dùng chung cho brand |
| `menu_overrides` | Override giá/trạng thái theo chi nhánh |

### 6.3 Orders & Rides
| Collection | Mô tả |
|------------|-------|
| `carts` | Giỏ hàng |
| `orders` | Đơn hàng (delivery, dine-in) |
| `order_items` | Chi tiết item trong đơn |
| `rides` | Chuyến đi xe |
| `tables` | Bàn trong quán (dine-in) |
| `table_sessions` | Phiên đặt món tại bàn |

### 6.4 Payments & Wallet
| Collection | Mô tả |
|------------|-------|
| `payments` | Giao dịch thanh toán |
| `wallets` | Ví driver/merchant |
| `wallet_transactions` | Lịch sử giao dịch ví |
| `withdrawals` | Yêu cầu rút tiền |
| `commissions` | Phí hoa hồng platform |

### 6.5 Promotions
| Collection | Mô tả |
|------------|-------|
| `promotions` | Chương trình khuyến mãi |
| `vouchers` | Mã voucher |
| `voucher_usages` | Lịch sử sử dụng voucher |
| `flash_sales` | Flash sale campaigns |

### 6.6 Others
| Collection | Mô tả |
|------------|-------|
| `reviews` | Đánh giá đơn/chuyến |
| `chat_rooms` | Phòng chat |
| `chat_messages` | Tin nhắn |
| `notifications` | Thông báo |

---

## 7. BUSINESS LOGIC HIGHLIGHTS

### 7.1 Merchant Tier System
| Tier | Yêu cầu | Commission |
|------|---------|------------|
| Regular | Mới đăng ký | 25% |
| Preferred | 100+ đơn/tháng, rating >= 4.5 | 20% |
| Premium | 500+ đơn/tháng, rating >= 4.8 | 15% |

### 7.2 Voucher Stacking
- Mỗi đơn hàng có thể áp dụng **tối đa 2 vouchers**:
  - 1x **Food Voucher** (Platform HOẶC Merchant)
  - 1x **Delivery Voucher** (Platform)

### 7.3 Driver Assignment
```
Priority Order:
1. Driver gần nhất (< 3km)
2. Rating cao (>= 4.5)
3. Có đơn cùng hướng (order batching)
4. Thời gian online lâu nhất
```

---

## 8. DEVELOPMENT PHASES

| Phase | Nội dung | Status |
|-------|----------|--------|
| **Phase 1** | Planning & Documentation | ✅ In Progress |
| **Phase 2** | Project Setup (Monorepo, NestJS, Flutter, React) | ⏳ Pending |
| **Phase 3** | Core Features (Auth, Menu, Orders) | ⏳ Pending |
| **Phase 4** | Advanced Features (Payments, AI, Chat) | ⏳ Pending |
| **Phase 5** | Testing & Optimization | ⏳ Pending |
| **Phase 6** | Deployment & Launch | ⏳ Pending |

---

## 9. QUICK LINKS

| Document | Mô tả |
|----------|-------|
| [requirement.md](./requirement.md) | Chi tiết yêu cầu dự án |
| [database-schema.md](./database-schema.md) | Thiết kế database MongoDB |
| [task.md](./task.md) | Theo dõi tiến độ |

---

*Last updated: January 2026*
