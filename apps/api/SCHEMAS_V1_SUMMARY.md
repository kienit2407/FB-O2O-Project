# FaB-O2O V1 Schemas Summary

## Overview
This document summarizes all MongoDB schemas (Mongoose) created for the FaB-O2O project V1 scope.

## Structure

```
src/
├── auth/schemas/
│   ├── user.schema.ts
│   └── user-device.schema.ts
├── customers/schemas/
│   └── customer-profile.schema.ts
├── drivers/schemas/
│   ├── driver-profile.schema.ts
│   └── driver-onboarding.schema.ts
├── merchants/schemas/
│   ├── merchant.schema.ts
│   ├── merchant-onboarding.schema.ts
│   ├── category.schema.ts
│   ├── product.schema.ts
│   ├── product-option.schema.ts
│   └── topping.schema.ts
├── dinein/schemas/
│   ├── table.schema.ts
│   └── table-session.schema.ts
├── carts/schemas/
│   └── cart.schema.ts
├── orders/schemas/
│   └── order.schema.ts
├── promotions/schemas/
│   ├── promotion.schema.ts
│   ├── voucher.schema.ts
│   └── voucher-usage.schema.ts
├── ai/schemas/
│   ├── user-interaction.schema.ts
│   └── model-run.schema.ts
└── common/
    ├── interceptors/standard-response.interceptor.ts
    ├── filters/http-exception.filter.ts
    ├── modules/api-standard.module.ts
    └── skills/API_Standard.md
```

## Collections by Module

### 1. AUTH Module

#### users
```typescript
- _id
- email (unique sparse)
- phone (unique sparse)
- password_hash
- auth_methods
- oauth_providers
- full_name
- avatar_url
- date_of_birth
- role (enum: customer|driver|merchant_staff|admin|super_admin)
- status (enum: active|inactive|blocked|pending_verification|rejected)
- referral_code
- referred_by_code
- total_referrals
- language
- notification_enabled
- phone_verified_at
- email_verified_at
- last_login_at
- last_login_ip
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `phone` (unique, sparse)
- `email` (unique, sparse)
- `role, status`
- `referral_code`
- `deleted_at`

#### user_devices
```typescript
- _id
- user_id (ref: User)
- device_id
- platform
- app_version
- device_model
- os_version
- fcm_token (unique sparse)
- is_active
- last_seen_at
- device_name
- is_current_device
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `user_id, device_id` (unique)
- `fcm_token` (unique, sparse)
- `user_id, is_active`
- `deleted_at`

### 2. CUSTOMERS Module

#### customer_profiles
```typescript
- _id
- user_id (ref: User, unique)
- preferred_language
- current_location (GeoJSON Point)
- delivery_addresses (array)
- total_orders
- total_spent
- reward_points
- favorite_merchant_ids
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `user_id` (unique)
- `current_location.coordinates` (2dsphere)
- `deleted_at`

### 3. DRIVERS Module

#### driver_profiles
```typescript
- _id
- user_id (ref: User, unique)
- phone
- approval_status (enum: draft|pending_review|approved|rejected|suspended)
- rejection_reason
- approved_at
- approved_by (ref: User)
- kyc (nested object)
- vehicle (nested object)
- bank_name
- bank_account_number
- bank_account_holder
- emergency_contact_name
- emergency_contact_phone
- total_deliveries
- total_rating
- rating_count
- is_online
- current_location (GeoJSON Point)
- working_hours (nested object)
- is_available
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `user_id` (unique)
- `current_location.coordinates` (2dsphere)
- `is_online, is_available`
- `deleted_at`

#### driver_onboarding
```typescript
- _id
- user_id (ref: User, unique)
- driver_id (ref: DriverProfile)
- current_step (enum)
- personal_info (nested object)
- kyc (nested object)
- vehicle_info (nested object)
- bank_info (nested object)
- is_completed
- submitted_at
- deleted_at
- created_at
- updated_at
```

### 4. MERCHANTS + MENU Module

#### merchants
```typescript
- _id
- owner_user_id (ref: User)
- name
- description
- phone
- email
- address
- location (GeoJSON Point)
- category (enum: restaurant|coffee|fastfood|bbq|drink|dessert|other)
- logo_url
- cover_image_url
- approval_status (enum: draft|pending_approval|approved|rejected|suspended)
- rejection_reason
- approved_at
- approved_by (ref: User)
- staff_user_ids (array ref: User)
- commission_rate
- tier
- settings (nested: min_order_amount, delivery_radius, prep_time, is_accepting_orders, operating_hours, dine_in_enabled)
- documents (nested object)
- total_orders
- total_rating
- rating_count
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `owner_user_id`
- `location.coordinates` (2dsphere)
- `approval_status, settings.is_accepting_orders`
- `deleted_at`

#### categories
```typescript
- _id
- merchant_id (ref: Merchant)
- name
- description
- image_url
- display_order
- is_active
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `merchant_id, is_active`
- `merchant_id, display_order`
- `deleted_at`

#### products
```typescript
- _id
- merchant_id (ref: Merchant)
- category_id (ref: Category)
- name
- description
- image_urls (array)
- base_price
- original_price
- unit
- preparation_time
- nutrition_info (nested object)
- is_available
- is_featured
- is_active
- display_order
- option_ids (array ref: ProductOption)
- topping_ids (array ref: Topping)
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `merchant_id, is_active`
- `category_id, is_active`
- `merchant_id, is_available`
- `is_featured, is_available`
- `deleted_at`

#### product_options
```typescript
- _id
- merchant_id (ref: Merchant)
- name
- min_selection
- max_selection
- choices (array)
- is_active
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `merchant_id, is_active`
- `deleted_at`

#### toppings
```typescript
- _id
- merchant_id (ref: Merchant)
- name
- description
- price
- image_urls (array)
- unit
- is_available
- is_active
- display_order
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `merchant_id, is_active`
- `is_available`
- `deleted_at`

### 5. DINE-IN Module

#### tables
```typescript
- _id
- merchant_id (ref: Merchant)
- table_number
- seating_capacity
- table_type (enum: standard|vip|private|outdoor)
- floor
- description
- location (GeoJSON Point)
- is_active
- is_available
- qr_code_url
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `merchant_id, table_number` (unique)
- `merchant_id, is_active`
- `merchant_id, is_available`
- `deleted_at`

#### table_sessions
```typescript
- _id
- merchant_id (ref: Merchant)
- table_id (ref: Table)
- customer_user_id (ref: User)
- party_size
- qr_code
- status (enum: active|completed|cancelled)
- started_at
- ended_at
- notes
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `merchant_id, started_at` (desc)
- `table_id, status`
- `qr_code` (unique sparse)
- `deleted_at`

### 6. CART + ORDER Module

#### carts
```typescript
- _id
- customer_user_id (ref: User)
- merchant_id (ref: Merchant)
- table_session_id (ref: TableSession)
- order_type (enum: delivery|dine_in)
- status (enum: active|checked_out|abandoned)
- items (array with product snapshot)
- subtotal
- delivery_fee
- service_fee
- discount_amount
- total_amount
- delivery_address (nested object)
- applied_promotion_id (ref: Promotion)
- applied_voucher_id (ref: Voucher)
- notes
- expires_at (TTL)
- checked_out_at
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `customer_user_id, merchant_id, order_type` (unique, partial: status=active & order_type=delivery)
- `table_session_id, merchant_id, order_type` (unique, partial: status=active & order_type=dine_in)
- `customer_user_id, status`
- `table_session_id, status`
- `expires_at` (TTL)
- `deleted_at`

#### orders
```typescript
- _id
- order_number (unique)
- customer_user_id (ref: User)
- merchant_id (ref: Merchant)
- table_session_id (ref: TableSession)
- order_type (enum: delivery|dine_in)
- status (enum: pending|confirmed|preparing|ready|out_for_delivery|delivered|completed|cancelled|refunded)
- items (array with product snapshot)
- subtotal
- delivery_fee
- service_fee
- discount_amount
- total_amount
- delivery_address (nested object)
- driver_profile_id (ref: DriverProfile)
- estimated_preparation_time
- estimated_delivery_time
- scheduled_for
- timeline (nested object)
- applied_promotion_id (ref: Promotion)
- applied_voucher_id (ref: Voucher)
- payment (nested object)
- notes
- merchant_notes
- rating
- review
- reviewed_by_user_id (ref: User)
- ai_analysis (nested object)
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `order_number` (unique)
- `customer_user_id, created_at` (desc)
- `merchant_id, status, created_at` (desc)
- `driver_profile_id, status, created_at` (desc)
- `table_session_id`
- `status`
- `deleted_at`

### 7. PROMOTION Module

#### promotions
```typescript
- _id
- name
- description
- sponsor_type (enum: platform|merchant)
- merchant_id (ref: Merchant)
- scope (enum: food|delivery|both)
- type (enum: percentage|fixed_amount|buy_one_get_one|free_shipping)
- value
- max_discount_amount
- min_order_amount
- valid_from
- valid_to
- max_usage_limit
- used_count
- usage_limit_per_user
- applicable_merchant_ids (array)
- applicable_category_ids (array)
- applicable_product_ids (array)
- is_flash_sale
- remaining_quantity
- terms_and_conditions
- is_active
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `sponsor_type, merchant_id, scope, is_active`
- `valid_from, valid_to`
- `is_flash_sale, valid_to`
- `deleted_at`

#### vouchers
```typescript
- _id
- code (unique)
- name
- description
- promotion_id (ref: Promotion)
- type (enum: public|private)
- scope (enum: food|delivery|both)
- assigned_to_user_id (ref: User, sparse)
- valid_from
- valid_to
- usage_limit_per_user
- used_count
- applicable_merchant_ids (array)
- applicable_category_ids (array)
- applicable_product_ids (array)
- is_active
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `code` (unique)
- `promotion_id`
- `assigned_to_user_id` (sparse)
- `valid_from, valid_to`
- `is_active`
- `deleted_at`

#### voucher_usages
```typescript
- _id
- user_id (ref: User)
- voucher_id (ref: Voucher)
- order_id (ref: Order)
- scope (enum: food|delivery|both)
- discount_amount
- discount_snapshot (nested object)
- merchant_id (ref: Merchant)
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `order_id, scope` (unique)
- `user_id`
- `voucher_id`
- `created_at` (desc)
- `deleted_at`

### 8. AI Module

#### user_interactions
```typescript
- _id
- user_id (ref: User)
- product_id (ref: Product)
- merchant_id (ref: Merchant)
- category_id (ref: Category)
- action (enum: view|add_to_cart|order|favorite|search|click)
- search_query
- context (nested object)
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `user_id, created_at` (desc)
- `product_id, action`
- `merchant_id, action`
- `user_id, action, created_at` (desc)
- `deleted_at`

#### model_runs
```typescript
- _id
- model_type (enum: recommendation|prediction|classification)
- model_name
- user_id (ref: User)
- product_id (ref: Product)
- order_id (ref: Order)
- input (nested object)
- output (nested object)
- prediction_score
- execution_time_ms
- is_successful
- error_message
- deleted_at
- created_at
- updated_at
```
**Indexes:**
- `model_type, created_at` (desc)
- `user_id, created_at` (desc)
- `deleted_at`

## API Standard Components

### Standard Response Interceptor
Wraps all API responses in a consistent format:
```typescript
{
  statusCode: number,
  message: string,
  success: boolean,
  data: any,
  meta?: { page, limit, total, totalPages }
}
```

### HTTP Exception Filter
Standardizes error responses:
```typescript
{
  statusCode: number,
  message: string,
  success: false,
  errorCode?: string,
  details?: any,
  timestamp: string,
  path: string
}
```

## Naming Conventions

- **Collections**: Plural snake_case (e.g., `users`, `customer_profiles`)
- **Fields**: snake_case (e.g., `user_id`, `created_at`, `approval_status`)
- **Enums**: PascalCase with underscores (e.g., `MerchantApprovalStatus`)
- **Classes**: PascalCase (e.g., `User`, `MerchantProfile`)

## Common Patterns

### Soft Delete
All schemas include `deleted_at` field (nullable) for soft delete functionality.

### Timestamps
All schemas use `@Schema({ timestamps: true })` which automatically creates `created_at` and `updated_at`.

### References
All references use `@Prop({ type: Types.ObjectId, ref: 'ModelName' })` and have proper indexes.

### GeoJSON
Location fields follow the pattern:
```typescript
location: {
  type: "Point",
  coordinates: [longitude, latitude]
}
```
With `2dsphere` index for geospatial queries.

## Next Steps

1. Create service classes for each module
2. Create controller classes following API Standard
3. Implement validation DTOs
4. Add proper error handling in service layers
5. Implement logging with context

## Excluded from V1

The following ride-hailing related schemas were **excluded** per V1 scope:
- rides
- ride_requests
- ride_matches
- surge_pricing
- driver_locations_history
