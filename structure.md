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
│   ├── api-gateway/              # NestJS API Gateway (BFF)
│   ├── auth-service/             # Authentication & Authorization
│   ├── user-service/             # User profiles, devices
│   ├── merchant-service/         # Merchants, brands, menu management
│   ├── order-service/            # Orders, carts, table sessions
│   ├── ride-service/             # Rides, driver matching, tracking
│   ├── payment-service/          # Payments, wallets, withdrawals
│   ├── notification-service/     # Push notifications, chat, emails
│   ├── promotion-service/        # Vouchers, promotions, flash sales
│   ├── search-service/           # Elasticsearch (optional)
│   ├── ai-service/               # Python FastAPI - Recommendation engine
│   │
│   ├── web/                      # React Web Portal (Admin + Merchant)
│   └── mobile/                   # Flutter Mobile App (Customer + Driver)
│
├── packages/
│   ├── contracts/                # Shared API types + Event schemas
│   ├── shared-utils/             # Common utilities, validators
│   └── tsconfig/                 # Shared TypeScript config
│
├── infra/
│   ├── docker/                   # Dockerfiles, docker-compose
│   ├── k8s/                      # Kubernetes manifests
│   └── scripts/                  # Build/deploy/migrate scripts
│
├── docs/
│   ├── adr/                      # Architecture Decision Records
│   └── api/                      # OpenAPI specs, Postman collections
│
├── .github/                      # CI/CD pipelines
├── .editorconfig
├── .gitignore
├── biome.json                    # Linter/Formatter
└── README.md
```

### 3.1 Service Communication

| Type | Protocol | Use Case |
|------|----------|----------|
| **Gateway → Services** | REST/HTTP | External API requests |
| **Service → Service** | gRPC (optional) | High-performance internal calls |
| **Async Events** | Kafka | Event-driven communication |
| **Real-time** | WebSocket | Chat, live tracking |

### 3.2 Event-Driven Architecture (Kafka Topics)

```
auth.events:
  - user.verified
  - user.profile.updated

order.events:
  - order.created
  - order.status.changed
  - order.completed

ride.events:
  - ride.requested
  - ride.assigned
  - ride.started
  - ride.completed

payment.events:
  - payment.initiated
  - payment.completed
  - payment.failed
  - wallet.updated

notification.events:
  - notification.push
  - notification.email

merchant.events:
  - merchant.approveda
  - menu.updated
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

### 5.1 Microservices Structure

Tất cả microservices đều tuân theo cấu trúc chuẩn NestJS:

```
apps/{service-name}/
├── src/
│   ├── main.ts                   # Service bootstrap
│   ├── app.module.ts             # Root module
│   │
│   ├── common/                   # Shared utilities (guards, filters, pipes)
│   ├── config/                   # Database, Redis, Kafka config
│   │
│   ├── modules/                  # Feature modules
│   │   ├── {feature}/
│   │   │   ├── {feature}.module.ts
│   │   │   ├── {feature}.controller.ts
│   │   │   ├── {feature}.service.ts
│   │   │   ├── dto/
│   │   │   └── events/           # Kafka event producers/consumers
│   │
│   └── database/
│       ├── schemas/              # Mongoose schemas
│       └── seeders/
│
├── test/
├── nest-cli.json
├── tsconfig.json
└── package.json
```

### 5.1.1 API Gateway (`apps/api-gateway/`)

```
apps/api-gateway/
├── src/
│   ├── main.ts                   # Gateway bootstrap
│   ├── app.module.ts
│   │
│   ├── config/                   # Routes configuration
│   │   └── routes.ts
│   │
│   ├── gateway/                  # Custom gateway logic
│   │   ├── auth.guard.ts         # Verify JWT tokens
│   │   ├── rate-limit.guard.ts   # Rate limiting
│   │   └── transform.interceptor.ts  # Response transform
│   │
│   └── modules/
│       ├── auth/                 # Proxy to auth-service
│       ├── users/                # Proxy to user-service
│       ├── merchants/            # Proxy to merchant-service
│       ├── orders/               # Proxy to order-service
│       ├── rides/                # Proxy to ride-service
│       ├── payments/             # Proxy to payment-service
│       └── promotions/           # Proxy to promotion-service
```

**Responsibilities:**
- Request routing đến các microservices tương ứng
- Authentication/Authorization (JWT verification)
- Rate limiting & throttling
- Response aggregation (nếu cần)
- Load balancing

---

### 5.1.2 Auth Service (`apps/auth-service/`)

```
apps/auth-service/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── otp.strategy.ts
│   │   │   └── events/
│   │   │       ├── user-verified.event.ts
│   │   │       └── user-verified.handler.ts
│   │   └── otp/
│   │       ├── otp.controller.ts
│   │       └── otp.service.ts
│   │
│   └── database/
│       └── schemas/
│           ├── user.schema.ts
│           ├── otp-code.schema.ts
│           └── user-device.schema.ts
```

**Responsibilities:**
- OTP verification (phone number)
- JWT token generation & validation
- Login/Logout (email/password cho merchant/admin)
- Refresh token rotation
- Device management (FCM tokens)

---

### 5.1.3 User Service (`apps/user-service/`)

```
apps/user-service/
├── src/
│   ├── modules/
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── events/
│   │   │       └── user-profile-updated.handler.ts
│   │   ├── customer-profiles/
│   │   └── driver-profiles/
│   │       ├── driver-profiles.service.ts
│   │       └── verification/      # Driver verification docs
│   │
│   └── database/
│       └── schemas/
│           ├── user.schema.ts
│           ├── customer-profile.schema.ts
│           ├── driver-profile.schema.ts
│           └── merchant-staff.schema.ts
```

**Responsibilities:**
- User profile management
- Customer profiles (delivery address, preferences)
- Driver profiles (vehicle info, documents, rating)
- Merchant staff profiles

---

### 5.1.4 Merchant Service (`apps/merchant-service/`)

```
apps/merchant-service/
├── src/
│   ├── modules/
│   │   ├── brands/
│   │   │   ├── brands.controller.ts
│   │   │   └── brands.service.ts
│   │   ├── merchants/
│   │   │   ├── merchants.controller.ts
│   │   │   ├── merchants.service.ts
│   │   │   └── events/
│   │   │       └── merchant-approved.handler.ts
│   │   ├── products/
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── options/
│   │   │   └── toppings/
│   │   ├── categories/
│   │   └── menus/
│   │       ├── menu-templates.service.ts
│   │       └── menu-overrides.service.ts
│   │
│   └── database/
│       └── schemas/
│           ├── brand.schema.ts
│           ├── merchant.schema.ts
│           ├── category.schema.ts
│           ├── product.schema.ts
│           ├── option.schema.ts
│           ├── topping.schema.ts
│           ├── menu-template.schema.ts
│           ├── menu-override.schema.ts
│           └── table.schema.ts
```

**Responsibilities:**
- Brand & merchant management
- Menu management (categories, products, options, toppings)
- Menu templates (brand-level) & overrides (merchant-level)
- Table management (dine-in QR)
- Business hours management

---

### 5.1.5 Order Service (`apps/order-service/`)

```
apps/order-service/
├── src/
│   ├── modules/
│   │   ├── carts/
│   │   │   ├── carts.controller.ts
│   │   │   └── carts.service.ts
│   │   ├── orders/
│   │   │   ├── orders.controller.ts
│   │   │   ├── orders.service.ts
│   │   │   ├── workflow/
│   │   │   │   └── order-status-machine.ts
│   │   │   └── events/
│   │   │       ├── order-created.event.ts
│   │   │       ├── order-status-changed.event.ts
│   │   │       └── order-completed.event.ts
│   │   ├── table-sessions/
│   │   │   └── dine-in logic
│   │   └── reviews/
│   │
│   └── database/
│       └── schemas/
│           ├── cart.schema.ts
│           ├── cart-item.schema.ts
│           ├── order.schema.ts
│           ├── order-item.schema.ts
│           ├── table-session.schema.ts
│           └── review.schema.ts
```

**Responsibilities:**
- Cart management
- Order creation & lifecycle
- Order status workflow
- Table sessions (dine-in)
- Order reviews & ratings
- Emit events to other services (payment, notification, etc.)

---

### 5.1.6 Ride Service (`apps/ride-service/`)

```
apps/ride-service/
├── src/
│   ├── modules/
│   │   ├── rides/
│   │   │   ├── rides.controller.ts
│   │   │   ├── rides.service.ts
│   │   │   ├── matching/              # Driver matching algorithm
│   │   │   │   ├── driver-selector.service.ts
│   │   │   │   └── matching-engine.service.ts
│   │   │   └── events/
│   │   │       ├── ride-requested.event.ts
│   │   │       ├── ride-assigned.event.ts
│   │   │       ├── ride-started.event.ts
│   │   │       └── ride-completed.event.ts
│   │   ├── tracking/                 # Real-time location tracking
│   │   │   └── location-updates.service.ts
│   │   └── pricing/
│   │       └── fare-calculator.service.ts
│   │
│   └── database/
│       └── schemas/
│           ├── ride.schema.ts
│           └── ride-tracking.schema.ts
```

**Responsibilities:**
- Ride creation & matching
- Driver assignment algorithm (distance, rating, batching)
- Real-time location tracking
- Fare calculation (distance, time, surge pricing)
- Ride status workflow
- OTP verification for pickup/dropoff

---

### 5.1.7 Payment Service (`apps/payment-service/`)

```
apps/payment-service/
├── src/
│   ├── modules/
│   │   ├── payments/
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── gateways/
│   │   │   │   ├── vnpay.gateway.ts
│   │   │   │   ├── momo.gateway.ts
│   │   │   │   └── zalopay.gateway.ts
│   │   │   └── events/
│   │   │       ├── payment-initiated.event.ts
│   │   │       ├── payment-completed.event.ts
│   │   │       └── payment-failed.event.ts
│   │   ├── wallets/
│   │   │   ├── wallets.controller.ts
│   │   │   ├── wallets.service.ts
│   │   │   └── events/
│   │   │       └── wallet-updated.event.ts
│   │   ├── withdrawals/
│   │   └── commissions/
│   │
│   └── database/
│       └── schemas/
│           ├── payment.schema.ts
│           ├── wallet.schema.ts
│           ├── wallet-transaction.schema.ts
│           ├── withdrawal.schema.ts
│           └── commission.schema.ts
```

**Responsibilities:**
- Payment gateway integration (VNPay, MoMo, ZaloPay)
- Wallet management (driver, merchant)
- Withdrawal requests
- Commission calculation & settlement
- Payment webhooks handling

---

### 5.1.8 Notification Service (`apps/notification-service/`)

```
apps/notification-service/
├── src/
│   ├── modules/
│   │   ├── notifications/
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   └── events/
│   │   │       ├── notification-push.handler.ts
│   │   │       └── notification-email.handler.ts
│   │   ├── push/
│   │   │   └── fcm.service.ts
│   │   ├── email/
│   │   │   └── resend.service.ts
│   │   ├── chat/
│   │   │   ├── chat.gateway.ts       # WebSocket gateway
│   │   │   ├── chat.service.ts
│   │   │   └── events/
│   │   └── in-app/                   # In-app notifications
│   │
│   └── database/
│       └── schemas/
│           ├── notification.schema.ts
│           ├── chat-room.schema.ts
│           └── chat-message.schema.ts
```

**Responsibilities:**
- Push notifications (Firebase FCM)
- Email notifications (Resend)
- Real-time chat (WebSocket)
- In-app notifications
- Template management for different notification types

---

### 5.1.9 Promotion Service (`apps/promotion-service/`)

```
apps/promotion-service/
├── src/
│   ├── modules/
│   │   ├── promotions/
│   │   │   ├── promotions.controller.ts
│   │   │   └── promotions.service.ts
│   │   ├── vouchers/
│   │   │   ├── vouchers.controller.ts
│   │   │   ├── vouchers.service.ts
│   │   │   ├── validation/
│   │   │   │   └── voucher-validator.service.ts
│   │   │   └── usage/
│   │   │       └── voucher-usage.handler.ts
│   │   ├── flash-sales/
│   │   │   ├── flash-sales.controller.ts
│   │   │   └── flash-sales.service.ts
│   │   └── campaigns/
│   │
│   └── database/
│       └── schemas/
│           ├── promotion.schema.ts
│           ├── voucher.schema.ts
│           ├── voucher-usage.schema.ts
│           └── flash-sale.schema.ts
```

**Responsibilities:**
- Voucher creation & management
- Voucher validation (stacking rules)
- Promotion campaigns
- Flash sale management
- Voucher usage tracking

---

### 5.1.10 Search Service (`apps/search-service/`) - Optional

```
apps/search-service/
├── src/
│   ├── modules/
│   │   ├── search/
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts
│   │   │   └── indexes/
│   │   │       ├── merchant-index.ts
│   │   │       └── product-index.ts
│   │   └── events/
│   │       └── sync-data-to-elasticsearch.handler.ts
│   │
│   └── database/
│       └── schemas/                  # Elasticsearch index schemas
```

**Responsibilities:**
- Full-text search (merchants, products)
- Geospatial search (nearby merchants)
- Search autocomplete
- Real-time data sync from MongoDB → Elasticsearch

---

### 5.1.11 AI Service (`apps/ai-service/`) - Python FastAPI

```
apps/ai-service/
├── src/
│   ├── main.py                     # FastAPI bootstrap
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── recommend.py     # Recommendation endpoints
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── kafka_consumer.py
│   │   ├── ml/
│   │   │   ├── models/
│   │   │   │   └── recommendation_engine.py
│   │   │   └── training/
│   │   └── database/
│   │       └── mongodb.py
│   └── tests/
├── requirements.txt
└── pyproject.toml
```

**Responsibilities:**
- Food/merchant recommendation
- Driver matching optimization
- Dynamic pricing prediction
- Consume events from Kafka for training

---

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

### 6.1 Service → Collections Mapping

| Service | Collections |
|---------|-------------|
| **auth-service** | `users`, `otp_codes`, `user_devices` |
| **user-service** | `customer_profiles`, `driver_profiles`, `merchant_staff_profiles` |
| **merchant-service** | `brands`, `merchants`, `categories`, `products`, `options`, `toppings`, `menu_templates`, `menu_overrides`, `tables` |
| **order-service** | `carts`, `cart_items`, `orders`, `order_items`, `table_sessions`, `reviews` |
| **ride-service** | `rides`, `ride_tracking` |
| **payment-service** | `payments`, `wallets`, `wallet_transactions`, `withdrawals`, `commissions` |
| **promotion-service** | `promotions`, `vouchers`, `voucher_usages`, `flash_sales` |
| **notification-service** | `notifications`, `chat_rooms`, `chat_messages` |
| **search-service** | Elasticsearch indexes: `merchants`, `products` |

---

### 6.2 Users & Authentication Collections (auth-service, user-service)

| Collection | Description | Indexes |
|------------|-------------|---------|
| `users` | User accounts (customer, driver, merchant_staff, admin) | phone, email, role |
| `otp_codes` | OTP verification codes | phone, code, expires_at |
| `user_devices` | FCM tokens for push notifications | user_id |
| `customer_profiles` | Customer details (addresses, preferences) | user_id |
| `driver_profiles` | Driver details (vehicle, documents, rating) | user_id, status |
| `merchant_staff_profiles` | Merchant staff details | user_id, merchant_id |

---

### 6.3 Merchant & Product Collections (merchant-service)

| Collection | Description | Indexes |
|------------|-------------|---------|
| `brands` | Brand/company (Highland, Phúc Long) | slug, status |
| `merchants` | Store branches | brand_id, location, status |
| `categories` | Product categories | merchant_id, name |
| `products` | Products/menu items | merchant_id, category_id |
| `options` | Product options (size, temperature) | product_id |
| `toppings` | Product toppings (milk, sugar) | merchant_id |
| `menu_templates` | Shared menu template | brand_id |
| `menu_overrides` | Per-merchant price/status overrides | merchant_id, product_id |
| `tables` | Restaurant tables (for dine-in QR) | merchant_id, qr_code |

---

### 6.4 Order & Ride Collections (order-service, ride-service)

| Collection | Description | Indexes |
|------------|-------------|---------|
| `carts` | Shopping carts | user_id |
| `cart_items` | Items in cart | cart_id, product_id |
| `orders` | Orders (delivery, dine-in) | user_id, merchant_id, status |
| `order_items` | Order line items | order_id |
| `table_sessions` | Dine-in table sessions | table_id, status |
| `reviews` | Order/ride reviews | order_id, user_id |
| `rides` | Ride requests | user_id, driver_id, status |
| `ride_tracking` | Real-time ride locations | ride_id, timestamp |

---

### 6.5 Payment & Wallet Collections (payment-service)

| Collection | Description | Indexes |
|------------|-------------|---------|
| `payments` | Payment transactions | order_id, gateway, status |
| `wallets` | User wallets (driver, merchant) | user_id, balance |
| `wallet_transactions` | Wallet history | wallet_id, type |
| `withdrawals` | Withdrawal requests | user_id, status |
| `commissions` | Platform commissions | order_id, merchant_id |

---

### 6.6 Promotion Collections (promotion-service)

| Collection | Description | Indexes |
|------------|-------------|---------|
| `promotions` | Promo campaigns | type, status |
| `vouchers` | Voucher codes | code, type, status |
| `voucher_usages` | Voucher usage history | user_id, voucher_id |
| `flash_sales` | Flash sale campaigns | status, start_at |

---

### 6.7 Notification & Chat Collections (notification-service)

| Collection | Description | Indexes |
|------------|-------------|---------|
| `notifications` | Push/in-app notifications | user_id, read |
| `chat_rooms` | Chat rooms | participants |
| `chat_messages` | Chat messages | room_id, timestamp |

---

### 6.8 Search Indexes (search-service)

| Index | Description | Fields |
|-------|-------------|--------|
| `merchants` | Merchant search | name, tags, location |
| `products` | Product search | name, description, merchant_id |

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
| **Phase 2** | Project Setup (Monorepo, Microservices, Flutter, React) | ⏳ Pending |
| **Phase 3** | Core Services (Auth, User, Merchant, Order) | ⏳ Pending |
| **Phase 4** | Advanced Services (Ride, Payment, Notification, Promotion) | ⏳ Pending |
| **Phase 5** | AI Service & Search | ⏳ Pending |
| **Phase 6** | Testing & Optimization | ⏳ Pending |
| **Phase 7** | Deployment & Launch | ⏳ Pending |

---

## 9. QUICK LINKS

| Document | Mô tả |
|----------|-------|
| [requirement.md](./requirement.md) | Chi tiết yêu cầu dự án |
| [database-schema.md](./database-schema.md) | Thiết kế database MongoDB |
| [task.md](./task.md) | Theo dõi tiến độ |

---

*Last updated: January 2026*
