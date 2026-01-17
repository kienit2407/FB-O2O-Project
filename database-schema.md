# THIẾT KẾ DATABASE - FaB-O2O

## Tổng quan
- **Database:** MongoDB (NoSQL Document)
- **Naming convention:** snake_case cho collections và fields
- **Soft delete:** Dùng field `deleted_at` thay vì xóa cứng

---

## 1. USERS & AUTHENTICATION

### 1.1 Collection: `users`
Lưu trữ tất cả người dùng (Customer, Driver, Merchant Staff, Admin).

```javascript
{
  _id: ObjectId,                    // ID Mongo - định danh user toàn hệ thống

  // Thông tin cơ bản (đăng nhập/định danh)
  phone: String,                    // SĐT (unique) - dùng login OTP, liên hệ, chống tạo trùng tài khoản
  email: String,                    // Email (unique, optional) - dùng login OAuth/password, gửi hóa đơn, reset

  // Auth (cách user đăng nhập)
  password_hash: String,            // Hash mật khẩu (optional) - chủ yếu cho merchant/admin dùng web portal
  auth_methods: [String],           // [NEW] ["otp","password","google","facebook"] - app biết user có thể login cách nào

  // OAuth (nếu user login bằng social)
  oauth_providers: [
    {
      provider: String,             // "google" | "facebook" - loại nhà cung cấp OAuth
      provider_id: String,          // id từ provider - map đúng tài khoản social
      email: String                 // email trả về từ provider - hỗ trợ verify/hợp nhất tài khoản
    }
  ],

  // Profile (thông tin hiển thị)
  full_name: String,                // tên hiển thị trên app, hóa đơn, chat
  avatar_url: String,               // ảnh đại diện - hiển thị UI, chat, profile
  date_of_birth: Date,              // phục vụ phân nhóm, khuyến mãi theo tuổi (nếu có)
  gender: String,                   // "male"|"female"|"other" - thống kê/segment (optional)

  // Role & Status (phân quyền và trạng thái)
  role: String,                     // "customer"|"driver"|"merchant_staff"|"admin" - xác định module app được phép dùng
  status: String,                   // "active"|"inactive"|"blocked"|"pending" - khóa/mở user, chờ duyệt driver...

  // Referral (Giới thiệu bạn bè)
  referral_code: String,            // [NEW] Mã giới thiệu cá nhân unique - user chia sẻ mã này để mời bạn bè
                                    // Format: REF-{random_6_chars} hoặc custom
  referred_by_code: String,         // [NEW] Mã giới thiệu đã dùng khi đăng ký (ai giới thiệu user này)
  total_referrals: Number,          // [NEW] Số người đã giới thiệu thành công (cache) - hiển thị thành tích

  // Settings (cấu hình cá nhân)
  language: String,                 // "vi"|"en" - hiển thị ngôn ngữ app
  notification_enabled: Boolean,    // bật/tắt thông báo toàn bộ cho user (master switch)

  // Timestamps
  created_at: Date,                 // thời điểm tạo user - audit + thống kê
  updated_at: Date,                 // thời điểm update gần nhất - audit
  deleted_at: Date                  // soft delete - null nếu còn hoạt động, !=null nếu đã “xóa mềm”
}


```

### 1.2 Collection: `otp_codes`
Lưu mã OTP để xác thực đăng nhập/đăng ký qua SĐT.

**Chức năng:**
- C-AUTH-01: Đăng ký bằng SĐT → Nhập SĐT → Nhận OTP → Xác thực → Tạo tài khoản
- C-AUTH-02: Đăng nhập bằng SĐT → Nhập SĐT → OTP → Vào app
- D-AUTH-04: Tài xế đăng nhập SĐT + OTP
- Reset password qua SĐT

```javascript
{
  _id: ObjectId,                    // ID record OTP

  phone: String,                    // SĐT nhận OTP - dùng để gửi SMS và verify
  email: String,                    // Email nhận OTP (optional) - dùng cho reset password qua email

  code: String,                     // Mã OTP (nên hash) - 6 số ngẫu nhiên
  
  purpose: String,                  // Mục đích OTP:
                                    // "register" - đăng ký tài khoản mới
                                    // "login" - đăng nhập
                                    // "reset_password" - quên mật khẩu
                                    // "verify_phone" - xác thực SĐT mới
                                    // "verify_email" - xác thực email

  expires_at: Date,                 // Thời điểm hết hạn (thường 5 phút sau tạo)
  
  attempts: Number,                 // Số lần nhập sai - khóa nếu > 5 lần
  max_attempts: Number,             // Giới hạn số lần thử (default: 5)
  
  is_used: Boolean,                 // Đã sử dụng chưa - mỗi OTP chỉ dùng 1 lần
  used_at: Date,                    // Thời điểm sử dụng

  ip_address: String,               // IP request OTP - chống spam/fraud
  user_agent: String,               // Device info - audit

  created_at: Date                  // Thời điểm tạo OTP
}
```

**Logic xử lý:**
| Trường hợp | Xử lý |
|------------|-------|
| OTP hết hạn | Trả lỗi, yêu cầu gửi lại |
| Nhập sai 5 lần | Khóa 15 phút, yêu cầu gửi OTP mới |
| OTP đã dùng | Trả lỗi, yêu cầu gửi lại |
| Spam request | Rate limit: tối đa 3 OTP/số/10 phút |

### 1.3 Collection: `user_devices` -> dùng cái để push tin nhắn đẩy bằng firebase
```javascript
{
  _id: ObjectId,                    // ID record device

  user_id: ObjectId,                // ref users - device thuộc user nào

  device_id: String,                // định danh thiết bị (unique theo user) - phân biệt nhiều máy (điện thoại 1/2)
  platform: String,                 // "ios"|"android"|"web" - phân loại push và debug lỗi
  app_version: String,              // version app - hỗ trợ support, rollout, fix theo version

  fcm_token: String,                // token firebase - dùng để gửi push notification đến đúng device
  is_active: Boolean,               // true nếu còn đăng nhập; false khi logout/disable token

  last_seen_at: Date,               // lần cuối app online - dùng để cleanup token, thống kê active users
  created_at: Date,                 // tạo device record
  updated_at: Date                  // cập nhật token/version/last_seen
}
```

### 1.2 Collection: `customer_profiles`
Thông tin bổ sung cho Customer.

```javascript
{
  _id: ObjectId,                    // ID profile
  user_id: ObjectId,                // ref users (unique) - mỗi customer có 1 profile

  // Vị trí hiện tại (cache từ GPS)
  current_location: {
    type: "Point",                  // chuẩn GeoJSON - phục vụ query gần
    coordinates: [Number, Number],  // [lng,lat] - tìm quán gần, tính ship
    address: String,                // địa chỉ reverse geocode - hiển thị UI
    updated_at: Date                // thời điểm GPS update - kiểm soát “vị trí cũ”
  },

  // Địa chỉ đã lưu
  saved_addresses: [
    {
      _id: ObjectId,                // id cho từng địa chỉ để edit/delete
      label: String,                // "Nhà"|"Công ty"|"Khác" - hiển thị chọn nhanh
      address: String,              // địa chỉ text hiển thị

      location: {                   // tọa độ chuẩn để tính khoảng cách
        type: "Point",
        coordinates: [Number, Number]
      },

      address_details: {            // chi tiết để hiển thị/chuẩn hóa
        street_number: String,
        street: String,
        ward: String,
        district: String,
        city: String,
        country: String
      },

      address_source: String,       // "gps"|"search"|"map_pick" - biết nguồn để debug và tối ưu UX

      delivery_note: String,        // ghi chú giao hàng (tòa nhà, gọi trước...)
      receiver_name: String,        // nếu người nhận khác user
      receiver_phone: String,       // sđt người nhận

      is_default: Boolean,          // địa chỉ mặc định khi đặt
      created_at: Date,             // audit
      updated_at: Date              // audit
    }
  ],

  // Thống kê
  total_orders: Number,             // tổng số đơn food/dinein - phục vụ loyalty/segment
  total_spent: Number,              // tổng chi tiêu - phục vụ tier/segment

  created_at: Date,                 // tạo profile
  updated_at: Date                  // update profile
}

```

**Xử lý khi User từ chối GPS:**
| Trường hợp | Giải pháp |
|------------|-----------|
| Từ chối GPS | Hiện thanh tìm kiếm bắt buộc nhập địa chỉ |
| Chọn địa chỉ đã lưu | Dùng `location.coordinates` từ saved_addresses |
| Search địa chỉ mới | Gọi Geocoding API → Lấy tọa độ → Lưu |
| Chọn trên Map | Lấy tọa độ pin → Reverse Geocode → Lưu |
| Không có địa chỉ | Không cho đặt hàng, bắt nhập địa chỉ |


### 1.3 Collection: `driver_profiles`
Thông tin bổ sung cho Driver.

```javascript
{
  _id: ObjectId,                    // ID profile driver
  user_id: ObjectId,                // ref users (unique) - map đúng user

  // Giấy tờ cá nhân (KYC)
  id_card_number: String,           // số CCCD/CMND - verify danh tính
  id_card_front_url: String,        // ảnh mặt trước - lưu cloud để duyệt
  id_card_back_url: String,         // ảnh mặt sau - lưu cloud để duyệt

  // Bằng lái
  license_number: String,           // số GPLX - verify hợp pháp
  license_type: String,             // "A1"|"A2"|"B1"|"B2" - loại bằng
  license_image_url: String,        // ảnh GPLX - duyệt
  license_expiry: Date,             // hạn GPLX - cảnh báo hết hạn

  // Phương tiện
  vehicle_type: String,             // "motorbike"|"car" - match loại chuyến
  vehicle_brand: String,            // hãng xe - hiển thị & quản trị
  vehicle_model: String,            // model - hiển thị & quản trị
  vehicle_plate: String,            // biển số - đối soát/định danh
  vehicle_image_url: String,        // ảnh xe - duyệt/hiển thị

  // Trạng thái duyệt
  verification_status: String,      // "pending"|"approved"|"rejected" - kiểm soát driver hoạt động
  verification_note: String,        // ghi chú khi reject - giúp driver sửa
  verified_at: Date,                // lúc duyệt
  verified_by: ObjectId,            // admin user_id duyệt

  // Hoạt động nhận đơn
  is_online: Boolean,               // bật/tắt nhận đơn - dispatch dùng field này
  accept_food_orders: Boolean,      // nhận giao đồ ăn
  accept_ride_orders: Boolean,      // nhận chở khách
  current_location: {               // vị trí realtime - tìm driver gần
    type: "Point",
    coordinates: [Number, Number]
  },
  last_location_update: Date,       // timestamp update location - lọc driver “mất tín hiệu”

  // Thống kê
  total_deliveries: Number,         // tổng đơn giao - leaderboard/tier
  total_rides: Number,              // tổng chuyến - leaderboard/tier
  total_earnings: Number,           // tổng thu nhập - dashboard driver
  average_rating: Number,           // rating trung bình - sàng lọc chất lượng

  // Ngân hàng (rút tiền)
  bank_name: String,                // tên bank - payout
  bank_account_number: String,      // số tài khoản - payout
  bank_account_name: String,        // chủ TK - payout

  current_ride_id: ObjectId,     // driver đang chạy chuyến nào (null nếu rảnh)

  created_at: Date,                 // tạo profile
  updated_at: Date                  // update profile
}

```

---

## 2. MERCHANT & MENU

### 2.1 Collection: `brands`
Thương hiệu (chuỗi quán có nhiều chi nhánh).

```javascript
{
  _id: ObjectId,                    // id brand
  
  name: String,                     // tên brand - hiển thị
  logo_url: String,                 // logo - UI
  description: String,              // mô tả - UI/SEO

  owner_user_id: ObjectId,          // user chủ brand (optional) - phân quyền quản trị brand

  default_settings: {               // [NEW] cấu hình mặc định áp cho các branch
    commission_rate: Number,        // % hoa hồng mặc định của brand
    delivery_radius_km: Number,     // bán kính giao tối đa (lọc đơn/merchant)
    prep_time_min: Number           // thời gian chuẩn bị mặc định (ETA)
  },

  total_merchants: Number,          // thống kê nhanh số chi nhánh (cache)

  created_at: Date,
  updated_at: Date,
  deleted_at: Date                  // soft delete brand
}


```

### 2.2 Collection: `merchants`
Quán/Chi nhánh.

```javascript
{
  _id: ObjectId,                    // id merchant (branch)

  brand_id: ObjectId,               // ref brands - null nếu quán lẻ không thuộc chuỗi

  name: String,                     // tên hiển thị quán/chi nhánh
  description: String,              // mô tả
  logo_url: String,                 // logo hiển thị
  cover_image_url: String,          // ảnh cover hiển thị

  address: String,                  // địa chỉ text - UI
  location: {                       // tọa độ - tìm quán gần
    type: "Point",
    coordinates: [Number, Number]
  },

  phone: String,                    // liên hệ quán
  email: String,                    // liên hệ quán

  business_hours: [                 // giờ mở/đóng theo ngày
    {
      day: Number,                  // 0=CN ... 6=T7
      open_time: String,            // giờ mở (HH:mm) - UI & check nhận đơn
      close_time: String,           // giờ đóng (HH:mm)
      is_closed: Boolean            // đóng cả ngày
    }
  ],
  business_hours_updated_at: Date,  // [NEW] thời điểm ai đó cập nhật giờ (audit nhẹ)
  business_hours_updated_by: ObjectId, // [NEW] user_id cập nhật (để truy ngược)

  is_accepting_orders: Boolean,     // bật/tắt nhận đơn (override ngoài giờ hoặc tạm ngưng)
  min_order_amount: Number,         // đơn tối thiểu (rule checkout)
  average_prep_time: Number,        // thời gian chuẩn bị trung bình (ETA)

  status: String,                   // "pending"|"approved"|"rejected"|"suspended" - duyệt quán
  approved_at: Date,                // lúc duyệt
  approved_by: ObjectId,            // admin duyệt
  rejection_reason: String,         // lý do reject

  commission_rate: Number,          // % hoa hồng override; null => dùng brand.default hoặc system default

  menu_mode: String,                // "use_template"|"custom" - branch dùng menu template hay tự chỉnh
  menu_template_id: ObjectId,        // ref menu_templates - nếu use_template thì trỏ template

  settings_override: {              // override settings của brand cho branch này
    commission_rate: Number,        // override commission
    delivery_radius_km: Number,     // override radius
    prep_time_min: Number           // override prep time
  },

  tier: String,                     // "regular"|"preferred"|"premium" - phân tầng merchant
  tier_updated_at: Date,            // lúc update tier

  average_rating: Number,           // rating trung bình merchant
  total_reviews: Number,            // tổng review merchant
  total_orders: Number,             // tổng đơn merchant

  business_license_url: String,     // giấy phép kinh doanh - duyệt pháp lý

  created_at: Date,
  updated_at: Date,
  deleted_at: Date                  // soft delete merchant
}

```

### 2.3 Collection: `merchant_staff`
Nhân viên quán (liên kết user với merchant).

```javascript
{
  _id: ObjectId,                    // id mapping staff
  user_id: ObjectId,                // ref users - ai là staff
  merchant_id: ObjectId,            // ref merchants - thuộc quán nào

  role: String,                     // "owner"|"manager"|"staff" - role cấp cao
  permissions: [String],            // quyền chi tiết:
                                   // "manage_menu" (sửa menu)
                                   // "manage_orders" (xử lý đơn)
                                   // "view_reports" (xem báo cáo)
                                   // "manage_business_hours" (set giờ mở/đóng) [NEW]

  invited_by: ObjectId,             // user_id người mời
  joined_at: Date,                  // thời điểm tham gia

  created_at: Date,
  updated_at: Date
}


```

### 2.3 Collection: `menu_templates`
```javascript
{
  _id: ObjectId,                    // id template
  brand_id: ObjectId,               // brand sở hữu template

  name: String,                     // tên template
  status: String,                   // "active"|"archived" - disable template cũ

  categories: [
    {
      _id: ObjectId,                // id category trong template (để override)
      name: String,                 // tên danh mục
      description: String,          // mô tả
      sort_order: Number,           // thứ tự hiển thị

      items: [
        {
          _id: ObjectId,            // id item trong template (để override)
          name: String,             // tên món
          description: String,      // mô tả món
          image_urls: [String],     // ảnh món

          base_price: Number,       // giá gốc trong template
          sale_price: Number,       // giá sale optional

          options: [
            {
              _id: ObjectId,
              name: String,         // "Size", "Độ ngọt"
              type: String,         // "single"|"multiple"
              is_required: Boolean, // bắt buộc chọn không
              min_select: Number,   // min chọn
              max_select: Number,   // max chọn

              choices: [
                {
                  _id: ObjectId,
                  name: String,     // "Size L"
                  price_modifier: Number, // phụ thu
                  is_default: Boolean,    // default
                  is_available: Boolean   // còn áp dụng không
                }
              ],

              sort_order: Number
            }
          ],

          toppings: [
            {
              _id: ObjectId,
              name: String,
              price: Number,
              is_available: Boolean
            }
          ],

          sort_order: Number,
          is_active: Boolean        // item còn hiển thị trong template không
        }
      ]
    }
  ],

  version: Number,                  // tăng mỗi lần update để branch biết sync
  updated_by: ObjectId,             // user_id sửa template

  created_at: Date,
  updated_at: Date,
  deleted_at: Date
}

```

### 2.4 Collection: `branch_menu_overrides`
```javascript
{
  _id: ObjectId,
  merchant_id: ObjectId,            // branch nào override
  template_id: ObjectId,            // template nào đang dùng

  overrides: [
    {
      template_item_id: ObjectId,   // id item trong template
      is_hidden: Boolean,           // ẩn món ở branch này
      price_override: Number        // giá override; null => dùng giá template
    }
  ],

  updated_by: ObjectId,             // ai sửa override
  created_at: Date,
  updated_at: Date
}


```
### 2.5 Collection: `categories`
```javascript
{
  _id: ObjectId,
  merchant_id: ObjectId,            // quán nào sở hữu category

  name: String,                     // tên danh mục
  description: String,              // mô tả
  image_url: String,                // ảnh danh mục

  sort_order: Number,               // thứ tự hiển thị
  is_active: Boolean,               // bật/tắt hiển thị category

  created_at: Date,
  updated_at: Date,
  deleted_at: Date                  // [NEW] soft delete
}

```

### 2.5 Collection: `products`
Món ăn/Sản phẩm.

```javascript
{
  _id: ObjectId,
  merchant_id: ObjectId,            // quán sở hữu món
  category_id: ObjectId,            // thuộc category nào

  name: String,                     // tên món
  description: String,              // mô tả món
  image_urls: [String],             // ảnh món

  base_price: Number,               // giá gốc
  sale_price: Number,               // giá khuyến mãi optional

  is_available: Boolean,            // còn hàng/nhận làm không (tạm hết)
  is_active: Boolean,               // có hiển thị trong menu không

  total_sold: Number,               // thống kê bán
  average_rating: Number,           // rating món

  sort_order: Number,               // thứ tự hiển thị

  created_at: Date,
  updated_at: Date,
  deleted_at: Date
}

```

### 2.6 Collection: `product_options`
Nhóm tùy chọn (Size, Đường, Đá...).

```javascript
{
  _id: ObjectId,
  product_id: ObjectId,             // món nào có options này

  name: String,                     // tên nhóm option (Size, Độ ngọt)
  type: String,                     // "single"|"multiple"
  is_required: Boolean,             // bắt buộc chọn không
  min_select: Number,               // tối thiểu chọn bao nhiêu
  max_select: Number,               // tối đa chọn bao nhiêu

  choices: [
    {
      _id: ObjectId,
      name: String,                 // tên lựa chọn
      price_modifier: Number,       // phụ thu (+)
      is_default: Boolean,          // chọn mặc định
      is_available: Boolean         // còn áp dụng không
    }
  ],

  sort_order: Number,               // thứ tự nhóm option

  created_at: Date,
  updated_at: Date,
  deleted_at: Date                  // [NEW] soft delete option group
}

```

### 2.7 Collection: `toppings`
Topping (dùng chung cho nhiều sản phẩm của 1 merchant).

```javascript
{
  _id: ObjectId,
  merchant_id: ObjectId,            // quán sở hữu topping

  name: String,                     // tên topping
  price: Number,                    // giá topping
  image_url: String,                // ảnh topping

  applicable_categories: [ObjectId],// dùng cho category nào (lọc hiển thị topping theo nhóm)

  is_available: Boolean,            // còn topping không

  created_at: Date,
  updated_at: Date,
  deleted_at: Date                  // [NEW] soft delete topping
}

```
### 3.1 Collection: `merchant_audit_logs`
```javascript
{
  _id: ObjectId,
  merchant_id: ObjectId,            // quán bị thay đổi

  actor_user_id: ObjectId,          // ai thao tác (manager/owner/admin)
  action: String,                   // loại hành động: "update_business_hours" | "update_menu" | ...

  before: Object,                   // snapshot trước (để rollback/đối soát)
  after: Object,                    // snapshot sau

  created_at: Date                  // thời điểm thao tác
}

```
---

## 3. TABLES (Dine-in QR)

### 3.1 Collection: `tables`
Bàn trong quán.

```javascript
{
  _id: ObjectId,
  merchant_id: ObjectId,            // bàn thuộc quán nào

  table_number: String,             // mã bàn (unique trong merchant) - in QR và quản trị
  name: String,                     // tên hiển thị (VIP 1)
  capacity: Number,                 // số chỗ - gợi ý sắp bàn

  qr_code_url: String,              // link ảnh QR (in/hiển thị)
  qr_content: String,               // nội dung QR (table_id/session token)

  status: String,                   // "available"|"occupied"|"reserved" - trạng thái bàn
  current_session_id: ObjectId,     // session hiện tại nếu đang ăn

  is_active: Boolean,               // bàn còn sử dụng không

  created_at: Date,
  updated_at: Date,
  deleted_at: Date                  // [NEW] soft delete
}

```

### 3.2 Collection: `table_sessions`
Phiên ăn tại bàn.

```javascript
{
  _id: ObjectId,
  table_id: ObjectId,               // bàn nào
  merchant_id: ObjectId,            // quán nào (query nhanh theo merchant)

  customer_id: ObjectId,            // user nếu khách đăng nhập
  guest_name: String,               // tên khách vãng lai nếu không login

  status: String,                   // "active"|"completed"|"cancelled"

  started_at: Date,                 // bắt đầu ngồi
  ended_at: Date,                   // kết thúc phiên

  total_amount: Number,             // tổng tiền phiên (cache)

  created_at: Date,
  updated_at: Date
}

```

---

## 4. ORDERS

### 4.1 Collection: `orders`
Đơn hàng (Food Delivery + Dine-in).

```javascript
{
  _id: ObjectId,
  order_number: String,             // mã đơn unique (FO-YYYYMMDD-xxxxxx) - search nhanh + hiển thị

  order_type: String,               // "delivery"|"dine_in" - phân luồng xử lý và UI

  customer_id: ObjectId,            // user đặt
  merchant_id: ObjectId,            // quán nhận đơn
  driver_id: ObjectId,              // driver giao (optional)
  table_session_id: ObjectId,       // dine-in session (optional)

  items: [
    {
      _id: ObjectId,                // id item
      product_id: ObjectId,         // ref product

      product_name: String,         // snapshot tên để lịch sử không đổi
      product_image: String,        // snapshot ảnh

      quantity: Number,             // số lượng

      base_price: Number,           // snapshot giá gốc tại lúc đặt
      unit_price: Number,           // snapshot giá cuối 1 đơn vị (base + mods + toppings - sale)

      selected_options: [
        {
          option_name: String,      // snapshot tên nhóm option
          choice_name: String,      // snapshot lựa chọn
          price_modifier: Number    // snapshot phụ thu
        }
      ],

      selected_toppings: [
        {
          topping_id: ObjectId,     // ref topping
          topping_name: String,     // snapshot tên topping
          price: Number             // snapshot giá topping
        }
      ],

      note: String,                 // ghi chú món
      item_total: Number            // tổng tiền dòng item = unit_price * quantity
    }
  ],

  delivery_address: {               // chỉ có khi order_type="delivery"
    address: String,                // địa chỉ text hiển thị
    location: {                     // tọa độ giao để tính route
      type: "Point",
      coordinates: [Number, Number]
    },
    receiver_name: String,          // người nhận
    receiver_phone: String,         // sđt nhận
    note: String                    // note giao hàng
  },

  subtotal: Number,                 // tổng tiền món (sum item_total)
  delivery_fee: Number,             // phí ship
  platform_fee: Number,             // phí dịch vụ

  discounts: {                      // chuẩn hóa discount
    food_discount: Number,          // giảm trên món
    delivery_discount: Number,      // giảm trên ship
    total_discount: Number          // tổng giảm
  },

  applied_vouchers: [               // snapshot voucher đã áp vào đơn
    {
      voucher_id: ObjectId,         // voucher nào
      voucher_code: String,         // code hiển thị
      scope: String,                // "food"|"delivery"|"dine_in"
      sponsor: String,              // "platform"|"merchant"
      discount_amount: Number       // số tiền giảm thực tế
    }
  ],

  total_amount: Number,             // tổng phải trả = subtotal + delivery_fee + platform_fee - discounts.total_discount

  payment_method: String,           // "vnpay"|"momo"|"zalopay"|"cash"
  payment_status: String,           // "pending"|"paid"|"failed"|"refunded"
  paid_at: Date,                    // thời điểm thanh toán thành công

  status: String,                   // trạng thái đơn (pending/confirmed/...)
  status_history: [
    {
      status: String,               // trạng thái mới
      changed_at: Date,             // thời điểm đổi
      changed_by: ObjectId,         // ai đổi (merchant/driver/system)
      note: String                  // ghi chú (lý do)
    }
  ],

  estimated_prep_time: Number,      // phút - ETA chuẩn bị
  estimated_delivery_time: Date,    // ETA giao

  is_rated: Boolean,                // đã review chưa (để khóa review 1 lần)

  batch_id: ObjectId,               // nếu gộp đơn
  batch_sequence: Number,           // thứ tự trong batch

  cancelled_by: String,             // "customer"|"merchant"|"driver"|"system"
  cancel_reason: String,            // lý do hủy

  driver_assigned_at: Date,         // lúc assign driver
  driver_accept_deadline_at: Date,  // deadline để driver accept
  assignment_attempts: Number,      // số lần tìm driver (dispatch debugging)

  settlement: {                     // snapshot chia tiền để đối soát
    merchant_gross: Number,         // subtotal
    merchant_commission_rate: Number,
    merchant_commission_amount: Number,
    merchant_net: Number,           // tiền merchant nhận

    driver_gross: Number,           // delivery_fee
    driver_commission_rate: Number,
    driver_commission_amount: Number,
    driver_net: Number,             // tiền driver nhận

    platform_fee: Number,           // phí dịch vụ platform
    platform_revenue: Number,       // doanh thu platform
    sponsor_cost: Number            // chi phí platform tài trợ (voucher/ship)
  },

  created_at: Date,                 // tạo đơn
  updated_at: Date                  // cập nhật đơn
}

```

**Order Status (Delivery):**
| Status | Mô tả |
|--------|-------|
| `pending` | Chờ merchant xác nhận |
| `confirmed` | Merchant đã xác nhận |
| `preparing` | Đang chuẩn bị món |
| `ready_for_pickup` | Sẵn sàng, chờ tài xế |
| `driver_assigned` | Đã có tài xế nhận |
| `driver_arrived` | Tài xế đến quán |
| `picked_up` | Tài xế đã lấy hàng |
| `delivering` | Đang giao |
| `delivered` | Đã giao |
| `completed` | Hoàn thành |
| `cancelled` | Đã hủy |

**Order Status (Dine-in):**
| Status | Mô tả |
|--------|-------|
| `pending` | Chờ xác nhận |
| `confirmed` | Đã xác nhận |
| `preparing` | Đang làm |
| `served` | Đã phục vụ |
| `completed` | Hoàn thành |
| `cancelled` | Đã hủy |

### 4.2 Collection: `order_batches`
Gộp đơn (Smart Batching).

```javascript
{
  _id: ObjectId,
  driver_id: ObjectId,              // driver đang giao batch

  order_ids: [ObjectId],            // các order trong batch

  optimized_route: [                // route tối ưu để pickup/dropoff theo thứ tự
    {
      type: String,                 // "pickup"|"dropoff"
      order_id: ObjectId,           // order nào
      location: {                   // tọa độ điểm đến/đón
        type: "Point",
        coordinates: [Number, Number]
      },
      address: String,              // địa chỉ text
      sequence: Number              // thứ tự đi
    }
  ],

  total_distance: Number,           // tổng km batch
  estimated_time: Number,           // tổng phút

  status: String,                   // "active"|"completed"

  created_at: Date,
  updated_at: Date
}

```

---

## 5. RIDES (Ride-hailing)

### 5.1 Collection: `rides`
Chuyến xe.

```javascript
{
  _id: ObjectId,
  ride_number: String,              // mã chuyến unique

  customer_id: ObjectId,            // khách
  driver_id: ObjectId,              // tài xế cho //phép lưu driver_id: null => DO LÚC ĐANG TÌM KIẾM KHÔNG BIẾT 

  vehicle_type: String,             // "motorbike"|"car" - match driver

  pickup_location: {
    address: String,                // text UI
    location: { type: "Point", coordinates: [Number, Number] } // tọa độ đón
  },

  dropoff_location: {
    address: String,                // text UI
    location: { type: "Point", coordinates: [Number, Number] } // tọa độ trả
  },

  distance: Number,                 // km
  estimated_duration: Number,       // phút dự kiến
  actual_duration: Number,          // phút thực tế

  base_fare: Number,                // giá mở cửa
  distance_fare: Number,            // giá theo km
  surge_multiplier: Number,         // hệ số surge
  platform_fee: Number,             // phí dịch vụ

  discounts: {                      // giảm giá ride
    ride_discount: Number,
    total_discount: Number
  },

  applied_vouchers: [
    {
      voucher_id: ObjectId,
      voucher_code: String,
      scope: String,                // "ride"
      sponsor: String,              // "platform"|"merchant"
      discount_amount: Number
    }
  ],
  cancellation: {
  cancelled_fee: Number,        // phí hủy (0 nếu không)
  fee_charged: Boolean,         // đã thu chưa
  no_show: Boolean              // khách/tài xế không tới
}
  pickup_verification: {
  method: String,       // "otp"|"none"
  otp_code: String,     // hash/otp (không lưu plain nếu cẩn thận)
  verified_at: Date
}
  live_tracking: {
  driver_current_location: { type: "Point", coordinates: [Number, Number] }, // realtime
  updated_at: Date,                      // last update
  route_polyline: String                 // optional: vẽ đường đi (encoded polyline)
}
  matching: {
  search_radius_km: Number,          // bán kính đang tìm
  surge_applied: Number,             // hệ số surge đã áp
  attempt_no: Number,                // số lần tìm
  last_dispatched_at: Date,          // lần gần nhất bắn request
  expires_at: Date,                  // hạn tìm (hết thì cancel)
  candidate_driver_ids: [ObjectId],  // danh sách driver đã mời (optional, nhẹ)
  assigned_by: String                // "system"|"admin" (optional)
}
  total_fare: Number,               // tổng phải trả

  payment_method: String,
  payment_status: String,
  paid_at: Date,

  status: String,                   // searching/driver_assigned/...
  status_history: [
  { status: String, changed_at: Date, changed_by: ObjectId, note: String }
] 

  requested_at: Date,               // lúc đặt
  driver_accepted_at: Date,         // lúc driver nhận
  driver_arrived_at: Date,          // lúc đến đón
  started_at: Date,                 // bắt đầu chạy
  completed_at: Date,               // kết thúc

  is_rated: Boolean,                // đã review chưa

  settlement: {                     // snapshot chia tiền
    driver_gross: Number,
    driver_commission_rate: Number,
    driver_commission_amount: Number,
    driver_net: Number,
    platform_revenue: Number,
    sponsor_cost: Number
  },
  fare_breakdown: {
  base_fare: Number,
  distance_fare: Number,
  time_fare: Number,      // optional
  toll_fee: Number,       // optional
  tip: Number,            // optional
  surge_multiplier: Number,
  platform_fee: Number
},

  cancelled_by: String,
  cancel_reason: String,

  created_at: Date,
  updated_at: Date
}

```

**Ride Status:**
| Status | Mô tả |
|--------|-------|
| `searching` | Đang tìm tài xế |
| `driver_assigned` | Đã có tài xế |
| `driver_arriving` | Tài xế đang đến |
| `driver_arrived` | Tài xế đã đến điểm đón |
| `in_progress` | Đang di chuyển |
| `completed` | Hoàn thành |
| `cancelled` | Đã hủy |

---

## 6. PAYMENTS & WALLET

### 6.1 Collection: `payments`
Giao dịch thanh toán.

```javascript
{
  _id: ObjectId,

  order_id: ObjectId,               // optional - payment cho order
  ride_id: ObjectId,                // optional - payment cho ride
  user_id: ObjectId,                // ai trả tiền

  payment_method: String,           // "vnpay"|"momo"|"zalopay"|"cash"
  amount: Number,                   // số tiền thanh toán
  currency: String,                 // "VND"

  idempotency_key: String,          // unique - đảm bảo 1 intent thanh toán chỉ tạo 1 record

  gateway_transaction_id: String,   // mã giao dịch từ cổng thanh toán
  gateway_response: Object,         // raw response để debug/đối soát

  status: String,                   // "pending"|"processing"|"success"|"failed"|"refunded"

  refund_amount: Number,            // số tiền refund
  refund_reason: String,            // lý do refund
  refunded_at: Date,                // lúc refund

  created_at: Date,
  updated_at: Date,
  completed_at: Date                // lúc success/fail kết thúc attempt
}

```

### 6.2 Collection: `wallets`
Ví tiền (Driver & Merchant).

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,                // driver (ví driver)
  merchant_id: ObjectId,            // merchant (ví merchant, optional)

  wallet_type: String,              // "driver"|"merchant" - phân loại logic

  balance: Number,                  // số dư khả dụng
  pending_balance: Number,          // số dư chờ đối soát/chưa release

  created_at: Date,
  updated_at: Date
}

```

### 6.3 Collection: `wallet_transactions`
Lịch sử giao dịch ví.

```javascript
{
  _id: ObjectId,
  wallet_id: ObjectId,              // ví nào

  type: String,                     // "credit"|"debit" - cộng/trừ
  category: String,                 // "order_earning"|"ride_earning"|"commission"|"withdrawal"|"refund"

  amount: Number,                   // số tiền thay đổi
  balance_before: Number,           // số dư trước (đối soát)
  balance_after: Number,            // số dư sau

  order_id: ObjectId,               // liên kết nếu giao dịch từ order
  ride_id: ObjectId,                // liên kết nếu từ ride
  withdrawal_id: ObjectId,          // liên kết nếu rút tiền

  description: String,              // nội dung hiển thị (VD: "Earning from order FO-...")
  created_at: Date
}

```

### 6.4 Collection: `withdrawals`
Yêu cầu rút tiền.

```javascript
{
  _id: ObjectId,
  wallet_id: ObjectId,              // ví rút
  user_id: ObjectId,                // ai rút (driver/merchant owner)

  amount: Number,                   // số tiền rút

  bank_name: String,                // bank nhận
  bank_account_number: String,      // số tk
  bank_account_name: String,        // chủ tk

  status: String,                   // "pending"|"processing"|"completed"|"rejected"

  processed_by: ObjectId,           // admin xử lý
  processed_at: Date,               // lúc xử lý
  rejection_reason: String,         // lý do reject

  created_at: Date,
  updated_at: Date
}

```

---

## 7. PROMOTIONS & VOUCHERS

### 7.1 Collection: `banners`
Banner quảng cáo hiển thị trên app (Home, Popup).

**Chức năng:**
- C-HOME-01: Hiển thị banner khuyến mãi trên trang chủ (slide banner)
- A-PROMO-02: Admin tạo banner quảng cáo hiển thị trên app
- A-PROMO-03: Popup khuyến mãi khi mở app
- Quảng bá chiến dịch marketing, sự kiện đặc biệt

```javascript
{
  _id: ObjectId,                    // ID banner

  // Nội dung hiển thị
  title: String,                    // Tiêu đề banner (optional) - hiển thị overlay trên ảnh
  subtitle: String,                 // Phụ đề (optional)
  image_url: String,                // Ảnh banner (bắt buộc) - upload lên Cloudinary
  image_url_mobile: String,         // Ảnh cho mobile (optional) - tối ưu size

  // Hành động khi click
  action_type: String,              // Loại action khi user click:
                                    // "open_promotion" - mở chi tiết khuyến mãi
                                    // "open_merchant" - mở trang quán
                                    // "open_product" - mở chi tiết món
                                    // "open_category" - mở danh mục
                                    // "open_url" - mở link ngoài (webview)
                                    // "none" - không có action

  action_data: {                    // Payload để navigate theo action_type
    promotion_id: ObjectId,         // nếu open_promotion
    merchant_id: ObjectId,          // nếu open_merchant
    product_id: ObjectId,           // nếu open_product
    category_id: ObjectId,          // nếu open_category
    url: String,                    // nếu open_url
    deep_link: String               // deep link cho app (optional)
  },

  // Vị trí hiển thị
  display_position: String,         // Vị trí đặt banner:
                                    // "home_carousel" - slide chính trên Home
                                    // "home_middle" - giữa trang Home
                                    // "home_bottom" - cuối trang Home
                                    // "category_top" - đầu trang danh mục
                                    // "popup" - popup khi mở app
                                    // "splash" - màn hình splash

  // Đối tượng hiển thị
  target_audience: String,          // Đối tượng xem banner:
                                    // "all" - tất cả user
                                    // "new_user" - user mới (< 7 ngày)
                                    // "inactive_user" - user không đặt hàng > 30 ngày
                                    // "logged_in" - chỉ user đã đăng nhập
                                    // "guest" - chỉ user chưa đăng nhập

  target_platforms: [String],       // ["ios", "android", "web"] - platform hiển thị
  geo_fence: [String],              // Khu vực hiển thị (district/city) - rỗng = tất cả

  // Thời gian hiển thị
  start_date: Date,                 // Ngày bắt đầu hiển thị
  end_date: Date,                   // Ngày kết thúc hiển thị
  time_slots: [                     // Khung giờ hiển thị trong ngày (optional)
    { start: String, end: String }  // VD: {start: "11:00", end: "14:00"}
  ],

  // Popup settings (chỉ khi display_position = "popup")
  popup_settings: {
    show_once_per_day: Boolean,     // Chỉ hiện 1 lần/ngày/user
    show_on_first_open: Boolean,    // Chỉ hiện lần đầu mở app
    delay_seconds: Number,          // Delay trước khi hiện popup
    dismissible: Boolean            // User có thể tắt popup không
  },

  // Sắp xếp & trạng thái
  sort_order: Number,               // Thứ tự hiển thị (nhỏ = ưu tiên cao)
  is_active: Boolean,               // Bật/tắt banner

  // Thống kê (cache)
  stats: {
    impressions: Number,            // Số lần hiển thị
    clicks: Number,                 // Số lần click
    ctr: Number                     // Click-through rate (%)
  },

  // Audit
  created_by: ObjectId,             // Admin tạo banner
  created_at: Date,
  updated_at: Date,
  deleted_at: Date                  // Soft delete
}
```

**Ví dụ sử dụng:**
| Loại banner | display_position | action_type | Mô tả |
|-------------|------------------|-------------|-------|
| Flash Sale | home_carousel | open_promotion | Quảng bá chương trình giảm giá |
| Quán mới | home_middle | open_merchant | Giới thiệu quán mới |
| Popup ưu đãi | popup | open_promotion | Thông báo voucher khi mở app |
| Sự kiện | home_carousel | open_url | Link đến landing page |

### 7.2 Collection: `promotions`
Chương trình khuyến mãi.

```javascript
{
  _id: ObjectId,

  created_by_type: String,          // "platform"|"merchant" - ai tạo promo
  merchant_id: ObjectId,            // nếu merchant tạo thì set merchant_id

  name: String,                     // tên CTKM
  description: String,              // mô tả
  banner_image_url: String,         // banner UI

  scope: String,                    // "food"|"delivery"|"ride"|"dine_in" - phạm vi giảm

  type: String,                     // "percentage"|"fixed_amount"|"free_shipping"
  discount_value: Number,           // % hoặc số tiền
  max_discount: Number,             // trần giảm (nếu %)
  min_order_amount: Number,         // điều kiện tối thiểu

  // [NEW] Flash Sale & Campaign Settings (Requirement 2.1.2 E)
  campaign_type: String,            // Loại chiến dịch:
                                    // "normal" - khuyến mãi thường
                                    // "flash_sale" - Flash Sale giới hạn thời gian
                                    // "daily_deal" - Deal hàng ngày
                                    // "weekend_deal" - Deal cuối tuần
                                    // "monthly_event" - Sự kiện tháng (VD: ShopeeFood Day 20-21)

  flash_sale_settings: {            // [NEW] Cấu hình riêng cho Flash Sale
    countdown_enabled: Boolean,     // Hiển thị đồng hồ đếm ngược trên UI
    show_remaining_qty: Boolean,    // Hiển thị số lượng còn lại ("Còn 45/100")
    
    // Phân bổ voucher theo khung giờ (tránh hết sạch ngay đầu ngày)
    quantity_per_time_slot: [
      {
        start_time: String,         // "00:00"
        end_time: String,           // "06:00"
        quantity: Number            // 100 vouchers cho khung giờ này
      }
      // VD: 6-12h: 300, 12-18h: 400, 18-24h: 200
    ],
    
    // Thống kê realtime (cache)
    total_quantity: Number,         // Tổng số voucher phát hành
    remaining_quantity: Number,     // Số còn lại (update realtime)
    claimed_quantity: Number        // Số đã claim
  },

  conditions: {                     // điều kiện áp dụng
    valid_from: Date,               // start datetime
    valid_to: Date,                 // end datetime
    time_slots: [ { start:String, end:String } ],  // khung giờ áp dụng trong ngày
    applicable_days: [Number],      // 0..6 (lọc theo thứ)
    geo_fence: [String],            // khu vực áp dụng (district/cell)
    service_type: String,           // "delivery"|"dine_in"|"ride"
    applicable_merchants: [ObjectId], // rỗng => all
    user_segment: String            // "new_user"|"inactive_user"|"all_user"
  },

  stack_group: String,              // nhóm chồng voucher (food/delivery/ride)
  stack_priority: Number,           // ưu tiên nếu nhiều voucher cùng group

  total_usage_limit: Number,        // tổng lượt dùng toàn hệ thống
  per_user_limit: Number,           // giới hạn theo user
  current_usage: Number,            // đếm lượt đã dùng (cache)

  is_active: Boolean,               // bật/tắt promo
  is_featured: Boolean,             // hiện trên home/banner
  show_as_popup: Boolean,           // show popup

  created_at: Date,
  updated_at: Date
}

```

### 7.2 Collection: `vouchers`
Mã giảm giá cụ thể.

```javascript
{
  _id: ObjectId,
  promotion_id: ObjectId,           // voucher thuộc promotion nào

  code: String,                     // unique - user nhập/scan

  discount_value: Number,           // override nếu cần
  max_discount: Number,             // override
  min_order_amount: Number,         // override

  usage_limit: Number,              // tổng lượt dùng voucher này
  current_usage: Number,            // lượt đã dùng (cache)

  assigned_to_user: ObjectId,       // voucher cá nhân (optional)

  is_active: Boolean,               // bật/tắt

  start_date: Date,                 // thời gian bắt đầu voucher
  end_date: Date,                   // thời gian kết thúc voucher

  created_at: Date,
  updated_at: Date
}

```

### 7.3 Collection: `voucher_usages`
Lịch sử sử dụng voucher.

```javascript
{
  _id: ObjectId,
  voucher_id: ObjectId,             // voucher nào
  user_id: ObjectId,                // ai dùng
  order_id: ObjectId,               // dùng cho order (optional)
  ride_id: ObjectId,                // dùng cho ride (optional)

  scope: String,                    // "food"|"delivery"|"ride"|"dine_in"
  sponsor: String,                  // "platform"|"merchant"
  discount_applied: Number,         // số tiền giảm thực tế (snapshot)

  created_at: Date                  // thời điểm dùng (đối soát)
}

```

### 7.5 Collection: `referrals`
Chương trình giới thiệu bạn bè (Referral Program).

**Chức năng:**
- Requirement 2.1.2: Special Voucher - Referral: Giới thiệu bạn bè (cả 2 đều được voucher)
- User A giới thiệu User B → Khi B đặt đơn đầu tiên → Cả A và B đều nhận voucher
- Tracking hiệu quả chương trình referral

```javascript
{
  _id: ObjectId,                    // ID record referral

  // Người giới thiệu (Referrer)
  referrer_user_id: ObjectId,       // User giới thiệu (người chia sẻ mã)
  referral_code: String,            // Mã giới thiệu unique - user nhập khi đăng ký
                                    // Format: REF-{USER_ID_SHORT} hoặc custom

  // Người được giới thiệu (Referred)
  referred_user_id: ObjectId,       // User được giới thiệu (người mới đăng ký)
  referred_phone: String,           // SĐT người được giới thiệu (để track trước khi có user_id)

  // Trạng thái
  status: String,                   // Trạng thái referral:
                                    // "pending" - đã đăng ký nhưng chưa đặt đơn đầu tiên
                                    // "qualified" - đã đặt đơn đầu tiên thành công
                                    // "rewarded" - đã phát voucher cho cả 2 bên
                                    // "expired" - hết hạn (không đặt đơn trong 30 ngày)
                                    // "cancelled" - bị hủy (fraud detected)

  // Điều kiện hoàn thành
  qualifying_order_id: ObjectId,    // Đơn hàng đầu tiên của người được giới thiệu
  qualifying_order_amount: Number,  // Giá trị đơn hàng đó (để verify min_order nếu có)
  qualified_at: Date,               // Thời điểm hoàn thành điều kiện

  // Phần thưởng (Rewards)
  referrer_reward: {                // Phần thưởng cho người giới thiệu
    voucher_id: ObjectId,           // Voucher được tạo cho referrer
    voucher_code: String,           // Mã voucher
    discount_value: Number,         // Giá trị giảm
    status: String,                 // "pending"|"issued"|"used"|"expired"
    issued_at: Date                 // Thời điểm phát voucher
  },

  referred_reward: {                // Phần thưởng cho người được giới thiệu
    voucher_id: ObjectId,           // Voucher được tạo cho referred
    voucher_code: String,           // Mã voucher
    discount_value: Number,         // Giá trị giảm
    status: String,                 // "pending"|"issued"|"used"|"expired"
    issued_at: Date                 // Thời điểm phát voucher
  },

  // Campaign (nếu có nhiều chương trình referral khác nhau)
  campaign_id: ObjectId,            // Chương trình referral nào (optional)
  campaign_name: String,            // Tên chương trình (cache)

  // Tracking
  source: String,                   // Nguồn chia sẻ: "whatsapp"|"facebook"|"copy_link"|"qr_code"
  utm_source: String,               // UTM tracking (optional)

  // Timestamps
  registered_at: Date,              // Thời điểm người được giới thiệu đăng ký
  expires_at: Date,                 // Hạn để hoàn thành (thường 30 ngày sau đăng ký)
  
  created_at: Date,
  updated_at: Date
}
```

**Flow xử lý Referral:**
```
1. User A chia sẻ mã REF-A123
2. User B đăng ký với mã REF-A123 → Tạo referral record (status: pending)
3. User B đặt đơn đầu tiên thành công → Update status: qualified
4. System tạo voucher cho cả A và B → Update status: rewarded
5. Nếu B không đặt đơn trong 30 ngày → status: expired
```

**Quy tắc chống gian lận:**
| Rule | Mô tả |
|------|-------|
| Cùng device_id | Không cho phép self-referral |
| Cùng IP | Flag để review thủ công |
| SĐT đã từng đăng ký | Không được nhận reward |
| Đơn hàng bị hủy | Không tính là qualifying order |

---

## 8. RATINGS & REVIEWS

### 8.1 Collection: `reviews`
Đánh giá.

```javascript
{
  _id: ObjectId,

  review_type: String,              // "order"|"ride"|"merchant"

  user_id: ObjectId,                // người đánh giá
  order_id: ObjectId,               // nếu review order
  ride_id: ObjectId,                // nếu review ride
  merchant_id: ObjectId,            // review quán
  driver_id: ObjectId,              // review tài xế

  rating: Number,                   // 1-5 sao
  comment: String,                  // nội dung
  images: [String],                 // ảnh review (cloud)
  tags: [String],                   // tag nhanh

  reply: {                          // phản hồi từ merchant/driver
    content: String,
    replied_at: Date,
    replied_by: ObjectId
  },

  is_visible: Boolean,              // admin ẩn/hiện

  created_at: Date,
  updated_at: Date
}

```

---

## 9. CHAT & NOTIFICATIONS

### 9.1 Collection: `chat_rooms`
Phòng chat.

```javascript
{
  _id: ObjectId,

  order_id: ObjectId,               // chat theo đơn
  ride_id: ObjectId,                // chat theo chuyến

  participants: [
    {
      user_id: ObjectId,            // ai tham gia
      role: String,                 // "customer"|"driver"
      joined_at: Date               // lúc vào phòng
    }
  ],

  last_message: {                   // cache để load list chat nhanh
    content: String,
    sender_id: ObjectId,
    sent_at: Date
  },

  is_active: Boolean,               // chỉ active khi đơn/chuyến đang chạy

  created_at: Date,
  updated_at: Date
}

```

### 9.2 Collection: `chat_messages`
Tin nhắn.

```javascript
{
  _id: ObjectId,
  room_id: ObjectId,                // room nào
  sender_id: ObjectId,              // ai gửi

  message_type: String,             // "text"|"image"|"location"
  content: String,                  // text message
  image_url: String,                // link ảnh nếu type=image
  location: {                       // vị trí nếu type=location
    type: "Point",
    coordinates: [Number, Number]
  },

  is_read: Boolean,                 // đã đọc chưa (simple)
  read_at: Date,                    // lúc đọc

  created_at: Date                  // thời điểm gửi
}

```

### 9.3 Collection: `notifications`
Thông báo lưu trữ.

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,                // gửi cho ai

  type: String,                     // "order_update"|"promotion"|"system"
  title: String,                    // tiêu đề push/in-app
  body: String,                     // nội dung

  data: {                           // payload để app navigate
    action: String,                 // "open_order"|"open_promotion"
    order_id: ObjectId,
    ride_id: ObjectId,
    promotion_id: ObjectId
  },

  is_read: Boolean,                 // user đã đọc chưa
  read_at: Date,                    // lúc đọc

  created_at: Date                  // thời điểm tạo noti
}

```

---

## 10. SYSTEM & CONFIGURATION

### 10.1 Collection: `system_configs`
Cấu hình hệ thống.

```javascript
{
  _id: ObjectId,
  key: String,                      // unique key (vd: "base_delivery_fee")
  value: Mixed,                     // giá trị config (string/number/object)
  description: String,              // mô tả để admin hiểu

  updated_by: ObjectId,             // ai cập nhật config
  updated_at: Date                  // lúc cập nhật
}

```

**Các config mẫu:**
| Key | Value | Mô tả |
|-----|-------|-------|
| `default_merchant_commission` | 20 | % hoa hồng merchant |
| `default_driver_commission` | 15 | % hoa hồng driver |
| `base_delivery_fee` | 15000 | Phí ship cơ bản |
| `per_km_delivery_fee` | 5000 | Phí ship mỗi km |
| `platform_fee` | 2000 | Phí dịch vụ |
| `surge_threshold` | 50 | Số đơn/giờ kích hoạt surge |
| `surge_multiplier` | 1.5 | Hệ số surge |

### 10.2 Collection: `global_categories`
Danh mục toàn hệ thống (do Admin tạo).

```javascript
{
  _id: ObjectId,

  name: String,                     // danh mục toàn hệ thống
  icon_url: String,                 // icon UI
  image_url: String,                // ảnh UI

  sort_order: Number,               // thứ tự hiển thị
  is_active: Boolean,               // bật/tắt hiển thị

  created_at: Date,
  updated_at: Date
}

```

---

## 11. AI & RECOMMENDATIONS

### 11.1 Collection: `user_interactions`
Log hành vi người dùng (cho AI).

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,                // user nào

  action: String,                   // "view"|"add_to_cart"|"order"|"rate"
  weight: Number,                   // trọng số hành vi để training/recommend dễ hơn

  merchant_id: ObjectId,            // tương tác với merchant nào
  product_id: ObjectId,             // tương tác với sản phẩm nào

  source: String,                   // "search"|"home"|"recommendation"
  search_query: String,             // query nếu đến từ search

  rating: Number,                   // nếu action="rate"

  created_at: Date                  // timestamp event
}

```
### 11.2 Collection: `search_logs`
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,                // ai search

  search_query: String,             // từ khóa search
  geo_cell: String,                 // khu vực (district/geo cell) để phân tích nhu cầu theo vùng
  timestamp: Date,                  // thời điểm search

  num_results: Number,              // số kết quả trả về
  clicked_result_id: ObjectId,      // user click gì (merchant/product)
  clicked_position: Number,         // vị trí click (rank)

  filters_applied: {                // filter user chọn
    rating_gte: Number,
    distance_lte_km: Number,
    price_range: { min:Number, max:Number }
  },

  source: String,                   // "home"|"search"
  created_at: Date
}

```
### 11.2 Collection: `merchant_metrics_daily`
```javascript
{
  _id: ObjectId,
  merchant_id: ObjectId,            // quán nào
  date: Date,                       // ngày thống kê

  total_orders: Number,             // tổng đơn/ngày
  acceptance_rate: Number,          // tỷ lệ nhận đơn (confirmed/pending)
  cancellation_rate: Number,        // tỷ lệ hủy
  avg_prep_time: Number,            // chuẩn bị trung bình
  avg_rating: Number,               // rating trung bình

  created_at: Date                  // lúc tạo record
}

```

### 11.2 Collection: `merchant_tier_history`
```javascript
{
  _id: ObjectId,
  merchant_id: ObjectId,            // quán nào

  old_tier: String,                 // tier cũ
  new_tier: String,                 // tier mới
  evaluated_window_days: Number,    // cửa sổ tính (vd 30 ngày)

  evaluated_at: Date,               // lúc đánh giá
  reason: Object,                   // snapshot metrics làm lý do

  created_at: Date
}

```
### 11.2 Collection: `recommendations`
Kết quả gợi ý (cache từ Python service).

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,                // cho user nào

  type: String,                     // "products"|"merchants"

  items: [
    {
      item_id: ObjectId,            // product_id hoặc merchant_id
      score: Number,                // điểm gợi ý
      reason: String                // "based_on_history"|"popular"|"similar_users"
    }
  ],

  generated_at: Date,               // lúc generate
  expires_at: Date                  // TTL - hết hạn cache để generate lại
}

```
### 11.2 Collection: `carts`
```javascript
{
  _id: ObjectId,                       // id cart

  user_id: ObjectId,                   // user sở hữu giỏ - dùng load giỏ theo user
  merchant_id: ObjectId,               // giỏ của quán nào - đảm bảo "1 cart/merchant"

  status: String,                      // "active"|"checked_out"|"abandoned" - active: còn dùng
  source: String,                      // "home"|"search"|"merchant_detail" - biết user tạo giỏ từ đâu (optional)

  // Địa chỉ giao đang chọn (để tính ship/ETA trong lúc user chưa đặt)
  delivery_address_snapshot: {          // snapshot tạm, không thay saved_addresses
    address_id: ObjectId,              // ref customer_profiles.saved_addresses._id (optional)
    address: String,                   // text hiển thị
    location: {                        // tọa độ để tính ship
      type: "Point",
      coordinates: [Number, Number]
    },
    receiver_name: String,             // người nhận
    receiver_phone: String,            // sđt nhận
    note: String                       // note giao hàng
  },

  order_type: String,                  // "delivery"|"dine_in" - giỏ đặt giao hay ăn tại quán
  table_id: ObjectId,                  // nếu dine_in (optional) - bàn nào (nếu flow scan QR tạo giỏ)
  table_session_id: ObjectId,          // nếu dine_in có session (optional) - gắn vào session đang active

  // Item list (giữ trạng thái chọn của user)
  items: [
    {
      _id: ObjectId,                   // id dòng item trong cart (để update nhanh)

      product_id: ObjectId,            // ref products - id món
      quantity: Number,                // số lượng

      // snapshot hiển thị trong giỏ (để UI load nhanh, tránh phải join nhiều)
      product_name: String,            // snapshot tên món tại thời điểm add (UI)
      product_image: String,           // snapshot ảnh
      base_price: Number,              // snapshot giá gốc lúc add
      sale_price: Number,              // snapshot giá sale lúc add (optional)

      selected_options: [              // các option đã chọn
        {
          option_id: ObjectId,         // ref product_options._id (optional) - để validate
          option_name: String,         // snapshot tên group
          choice_id: ObjectId,         // id choice (optional)
          choice_name: String,         // snapshot tên choice
          price_modifier: Number       // snapshot phụ thu
        }
      ],

      selected_toppings: [
        {
          topping_id: ObjectId,        // ref toppings
          topping_name: String,        // snapshot
          price: Number                // snapshot
        }
      ],

      note: String,                    // ghi chú cho món
      item_total_estimated: Number,    // tổng tạm tính của dòng item (client/server có thể tính lại)
      created_at: Date,                // lúc add item
      updated_at: Date                 // lúc update qty/options
    }
  ],

  // tổng tiền tạm tính (để hiển thị nhanh; khi checkout phải recompute lại)
  pricing_estimate: {
    subtotal: Number,                  // tổng tiền món (sum items)
    delivery_fee: Number,              // ước tính phí ship (tính từ location + config)
    platform_fee: Number,              // phí dịch vụ ước tính
    discount_estimated: Number,        // giảm tạm tính nếu user đã chọn voucher (optional)
    total_estimated: Number            // tổng tạm tính
  },

  // Voucher đang chọn trong giỏ (chưa chắc chắn apply khi checkout)
  selected_vouchers: [
    {
      voucher_id: ObjectId,            // voucher user đang chọn
      voucher_code: String,            // code
      scope: String,                   // "food"|"delivery"|"dine_in"
      sponsor: String                  // "platform"|"merchant"
    }
  ],

  // dùng để chống sửa giá: lưu "version" dữ liệu menu tại thời điểm user add (optional)
  menu_version_snapshot: Number,       // ref menu_templates.version (nếu dùng template); giúp detect menu đổi

  // Expire logic
  expires_at: Date,                    // TTL: giỏ tự hết hạn (vd 7 ngày) - dọn rác + tránh dữ liệu phình
  last_active_at: Date,                // lần cuối user chạm vào giỏ - để set abandoned

  created_at: Date,
  updated_at: Date,
  deleted_at: Date                     // soft delete nếu muốn; thường carts dùng TTL là đủ
}

```
---

## 12. INDEXES ĐỀ XUẤT

```javascript
// USERS
db.users.createIndex({ phone: 1 }, { unique: true });                 // login OTP nhanh + unique
db.users.createIndex({ email: 1 }, { unique: true, sparse: true });   // login email (optional)
db.users.createIndex({ role: 1, status: 1 });                         // lọc user theo role/status
db.users.createIndex({ referral_code: 1 }, { unique: true, sparse: true }); // [NEW] tìm user theo mã giới thiệu

// OTP CODES [NEW]
db.otp_codes.createIndex({ phone: 1, purpose: 1, created_at: -1 });   // tìm OTP theo SĐT + mục đích
db.otp_codes.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL auto delete OTP hết hạn
db.otp_codes.createIndex({ email: 1, purpose: 1 }, { sparse: true }); // tìm OTP theo email

// USER DEVICES
db.user_devices.createIndex({ user_id: 1, device_id: 1 }, { unique: true }); // quản lý multi-device
db.user_devices.createIndex({ fcm_token: 1 }, { unique: true, sparse: true }); // tránh trùng token
db.user_devices.createIndex({ user_id: 1, is_active: 1 });                      // lấy device active để push

// CUSTOMER PROFILES
db.customer_profiles.createIndex({ user_id: 1 }, { unique: true });   // 1-1 profile
db.customer_profiles.createIndex({ current_location: "2dsphere" });   // optional nếu query theo vị trí

// DRIVER PROFILES
db.driver_profiles.createIndex({ user_id: 1 }, { unique: true });
db.driver_profiles.createIndex({ current_location: "2dsphere" });     // tìm driver gần
db.driver_profiles.createIndex({ is_online: 1, accept_food_orders: 1, accept_ride_orders: 1 }); // filter dispatch
db.driver_profiles.createIndex({ is_online: 1, accept_ride_orders: 1, current_ride_id: 1 });

// BRANDS
db.brands.createIndex({ name: 1 });

// MERCHANTS
db.merchants.createIndex({ location: "2dsphere" });                   // tìm quán gần
db.merchants.createIndex({ status: 1, is_accepting_orders: 1 });       // lọc quán hoạt động
db.merchants.createIndex({ brand_id: 1 });                             // lọc theo brand

// MERCHANT STAFF
db.merchant_staff.createIndex({ merchant_id: 1, user_id: 1 }, { unique: true }); // tránh map trùng
db.merchant_staff.createIndex({ user_id: 1, role: 1 });                           // lấy danh sách quán user quản lý

// MENU TEMPLATES / OVERRIDES
db.menu_templates.createIndex({ brand_id: 1, status: 1 });
db.branch_menu_overrides.createIndex({ merchant_id: 1, template_id: 1 }, { unique: true });

// CATEGORIES / PRODUCTS
db.categories.createIndex({ merchant_id: 1, is_active: 1 });
db.products.createIndex({ merchant_id: 1, is_active: 1 });
db.products.createIndex({ category_id: 1, is_active: 1 });

// OPTIONS / TOPPINGS
db.product_options.createIndex({ product_id: 1, deleted_at: 1 });
db.toppings.createIndex({ merchant_id: 1, is_available: 1 });

// TABLES / SESSIONS
db.tables.createIndex({ merchant_id: 1, table_number: 1 }, { unique: true }); // unique bàn trong quán
db.table_sessions.createIndex({ merchant_id: 1, started_at: -1 });

// ORDERS
db.orders.createIndex({ order_number: 1 }, { unique: true });
db.orders.createIndex({ customer_id: 1, created_at: -1 });
db.orders.createIndex({ merchant_id: 1, status: 1, created_at: -1 });
db.orders.createIndex({ driver_id: 1, status: 1, created_at: -1 });

// ORDER BATCHES
db.order_batches.createIndex({ driver_id: 1, status: 1, created_at: -1 });

// RIDES
db.rides.createIndex({ ride_number: 1 }, { unique: true });
db.rides.createIndex({ customer_id: 1, created_at: -1 });
db.rides.createIndex({ driver_id: 1, status: 1, created_at: -1 });


// PAYMENTS (retry allowed)
db.payments.createIndex({ order_id: 1, created_at: -1 });
db.payments.createIndex({ ride_id: 1, created_at: -1 });
db.payments.createIndex({ idempotency_key: 1 }, { unique: true }); // chống tạo trùng attempt

// REVIEWS
db.reviews.createIndex({ review_type: 1, order_id: 1, user_id: 1 }, { unique: true, sparse: true });
db.reviews.createIndex({ review_type: 1, ride_id: 1, user_id: 1 }, { unique: true, sparse: true });

// VOUCHERS / USAGES
db.vouchers.createIndex({ code: 1 }, { unique: true });
db.vouchers.createIndex({ promotion_id: 1 });
db.voucher_usages.createIndex({ user_id: 1, voucher_id: 1, created_at: -1 });

// BANNERS [NEW]
db.banners.createIndex({ display_position: 1, is_active: 1, sort_order: 1 }); // lấy banner theo vị trí
db.banners.createIndex({ start_date: 1, end_date: 1, is_active: 1 });         // lọc banner đang hiệu lực
db.banners.createIndex({ target_audience: 1, is_active: 1 });                  // lọc theo đối tượng

// REFERRALS [NEW]
db.referrals.createIndex({ referral_code: 1 });                                // tìm theo mã giới thiệu
db.referrals.createIndex({ referrer_user_id: 1, status: 1 });                  // lấy danh sách người đã giới thiệu
db.referrals.createIndex({ referred_user_id: 1 }, { unique: true });           // 1 user chỉ được giới thiệu 1 lần
db.referrals.createIndex({ status: 1, expires_at: 1 });                        // lọc pending + hết hạn

// AI LOGS
db.user_interactions.createIndex({ user_id: 1, created_at: -1 });
db.user_interactions.createIndex({ product_id: 1, action: 1 });
db.search_logs.createIndex({ search_query: 1, created_at: -1 });
db.search_logs.createIndex({ geo_cell: 1, created_at: -1 });

// METRICS / TIER
db.merchant_metrics_daily.createIndex({ merchant_id: 1, date: -1 }, { unique: true });
db.merchant_tier_history.createIndex({ merchant_id: 1, evaluated_at: -1 });

// AUDIT
db.merchant_audit_logs.createIndex({ merchant_id: 1, created_at: -1 });
db.merchant_audit_logs.createIndex({ actor_user_id: 1, created_at: -1 });


// CARTS
db.carts.createIndex({ user_id: 1, merchant_id: 1, status: 1 }, { unique: true, partialFilterExpression: { status: "active" } });
db.carts.createIndex({ user_id: 1, updated_at: -1 });
db.carts.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });
```

---

