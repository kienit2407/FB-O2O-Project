# TÀI LIỆU YÊU CẦU DỰ ÁN - FaB-O2O

## 1. GIỚI THIỆU TỔNG QUAN

### 1.1 Mô tả dự án
Hệ thống **Super App** kết hợp 3 dịch vụ chính:
- **Food Delivery**: Đặt đồ ăn giao hàng tận nơi
- **Ride-hailing**: Gọi xe máy/ô tô (giống Grab)
- **Dine-in QR**: Đặt món tại quán bằng cách quét mã QR

### 1.2 Công nghệ sử dụng
| Thành phần | Công nghệ |
|------------|-----------|
| App Khách hàng | Flutter (iOS/Android) |
| App Tài xế | Flutter (iOS/Android) |
| Web Merchant | ReactJS |
| Web Admin | ReactJS |
| Backend | NestJS (Microservices) |
| AI Service | Python (FastAPI) |
| Database | MongoDB |
| Cache | Redis |
| Message Queue | Kafka |
| Bản đồ | Track Asia + OSRM |
| Thanh toán | VNPay, MoMo, ZaloPay, Tiền mặt |

### 1.3 Dịch vụ bên thứ ba (Third-party Services)

| Service | Mục đích | Chi tiết |
|---------|----------|----------|
| **Firebase Cloud Messaging (FCM)** | Push Notification | Gửi thông báo đến mobile app |
| **Resend** | Email Service | Xác thực email, quên mật khẩu, thông báo |
| **Cloudinary** | Media Storage | Lưu trữ ảnh, video (món ăn, avatar, CMND) |
| **Track Asia** | Bản đồ | Hiển thị map trên Flutter app |
| **OSRM / GraphHopper** | Routing | Tính đường đi, khoảng cách |

#### 1.3.1 Firebase Cloud Messaging (FCM)
| Đối tượng | Loại thông báo |
|-----------|----------------|
| Customer | Đơn hàng được xác nhận, Tài xế đang đến, Đơn hoàn thành |
| Driver | Có đơn mới (kèm sound), Khách hủy đơn |
| Merchant | Có đơn mới từ khách, Tài xế đến lấy hàng |

#### 1.3.2 Resend (Email Service)
| Use case | Mô tả |
|----------|-------|
| Xác thực email | Gửi link xác thực khi đăng ký |
| Quên mật khẩu | Gửi link reset password |
| Thông báo Merchant | Email khi được Admin duyệt/từ chối |
| Thông báo Driver | Email khi hồ sơ được duyệt |
| Thông báo Admin | Email khi có sự kiện hệ thống quan trọng |

#### 1.3.3 Cloudinary (Media Storage)
| Loại file | Mô tả |
|-----------|-------|
| Ảnh món ăn | Upload từ Merchant khi tạo menu |
| Logo quán | Ảnh đại diện của Merchant |
| Avatar user | Ảnh profile Customer/Driver |
| Hồ sơ Driver | CMND/CCCD, Bằng lái xe, Ảnh xe |
| Banner quảng cáo | Ảnh promotion từ Admin |

#### 1.3.4 Track Asia (Maps cho Flutter)
| Chức năng | Mô tả |
|-----------|-------|
| Hiển thị bản đồ | Map tiles cho Customer/Driver app |
| Marker quán | Vị trí các quán trên bản đồ |
| Marker tài xế | Vị trí realtime của driver |
| Chọn địa điểm | Pick location trên bản đồ |
| Tracking route | Hiển thị đường đi |

---

## 2. PHÂN TÍCH HỆ THỐNG (Học từ ShopeeFood & GrabFood)

> **Mục tiêu:** Phân tích chi tiết 6 mảng chính của hệ thống để đảm bảo best practices từ các ông lớn trong ngành

### 2.1 HỆ THỐNG KHUYẾN MÃI (PROMOTION SYSTEM)

#### 2.1.1 Phân tích từ ShopeeFood & GrabFood

**ShopeeFood:**
- Platform Voucher: Freeship 100%, giảm 50% đơn hàng, Flash Sale 99%
- Merchant Voucher: Merchant tự tạo, tự chịu chi phí
- Stack Voucher: 1 Food Voucher + 1 Delivery Voucher

**GrabFood:**
- Platform chịu voucher giảm phí ship
- Merchant chịu voucher giảm giá món ăn

#### 2.1.2 Thiết kế cho FaB-O2O

**A. PLATFORM VOUCHER (Admin tạo - Platform chịu chi phí)**

1. **Delivery Voucher (Voucher phí ship)**
   - Freeship 100%: Platform trả toàn bộ phí ship cho Driver
   - Giảm % phí ship: Platform trả phần giảm, khách trả phần còn lại
   - Giảm số tiền cố định: Platform trả số tiền đó
   - **Lưu ý:** Driver vẫn nhận đủ tiền, Platform chịu phần giảm

2. **Food Voucher (Voucher giảm giá đơn hàng)**
   - Giảm % tổng đơn: Platform trả phần giảm cho Merchant
   - Giảm số tiền cố định: Platform trả số tiền đó cho Merchant
   - **Lưu ý:** Merchant vẫn nhận đủ tiền, Platform chịu phần giảm

3. **Special Voucher**
   - First Order: Voucher đơn đầu tiên (khuyến khích user mới)
   - Comeback: User không đặt hàng 30 ngày (kéo user quay lại)
   - Birthday: Sinh nhật user
   - Referral: Giới thiệu bạn bè (cả 2 đều được voucher)

**B. MERCHANT VOUCHER (Merchant tạo - Merchant chịu chi phí)**

1. **Item Discount (Giảm giá món)**
   - Giảm % cho món cụ thể
   - Giảm số tiền cho món cụ thể
   - Buy 1 Get 1

2. **Order Discount (Giảm giá đơn hàng)**
   - Giảm % tổng đơn
   - Giảm số tiền khi đủ điều kiện (VD: Đơn từ 100k giảm 20k)

**C. ĐIỀU KIỆN ÁP DỤNG VOUCHER**

```
Voucher Config:
├─ min_order_value: Đơn tối thiểu (VD: 50,000đ)
├─ max_discount_amount: Giảm tối đa (VD: 50,000đ)
├─ usage_limit_per_user: Số lần dùng/user (VD: 1 lần)
├─ total_usage_limit: Tổng số lượng voucher (VD: 1000 vouchers)
├─ valid_from, valid_to: Thời gian áp dụng
├─ time_slots: Giờ áp dụng
│  ├─ breakfast: 6:00-10:00
│  ├─ lunch: 10:00-14:00
│  ├─ dinner: 17:00-21:00
│  └─ late_night: 21:00-24:00
├─ applicable_days: Ngày áp dụng
│  ├─ weekdays: Thứ 2-6
│  ├─ weekends: Thứ 7, CN
│  └─ specific_dates: Ngày cụ thể
├─ geo_fence: Khu vực áp dụng (VD: Quận 1, Quận 7)
├─ service_type: delivery, dine-in, ride
├─ applicable_merchants: all hoặc specific merchants
└─ user_segment: new_user, all_user, inactive_user
```

**D. CƠ CHẾ STACK VOUCHER (Học từ ShopeeFood)**

User có thể dùng **tối đa 2 vouchers/đơn**:
1. **Food Voucher** (Platform HOẶC Merchant - chọn 1)
2. **Delivery Voucher** (Platform)

**Ví dụ:**
```
Giá món: 100,000đ
Merchant Voucher: Giảm 20% → 80,000đ
Platform Delivery Voucher: Freeship → 0đ ship
Khách trả: 80,000đ

Phân chia tiền:
- Merchant nhận: 100,000đ (Platform bù 20,000đ)
- Driver nhận: 20,000đ (Platform trả)
- Platform chi: 20,000đ (voucher) + 20,000đ (ship) = 40,000đ
```

**E. FLASH SALE CAMPAIGN**

```
Flash Sale Config:
├─ campaign_name: "ShopeeFood Day"
├─ campaign_type: flash_sale / daily_deal / weekend_deal
├─ start_time, end_time
├─ discount_value: 50% hoặc 50,000đ
├─ total_quantity: 1000 vouchers
├─ quantity_per_user: 1
├─ time_slots: Phân bổ voucher theo giờ
│  ├─ 00:00-06:00: 100 vouchers
│  ├─ 06:00-12:00: 300 vouchers
│  ├─ 12:00-18:00: 400 vouchers
│  └─ 18:00-24:00: 200 vouchers
└─ UI: Countdown timer, remaining quantity
```

---

### 2.2 QUẢN LÝ MULTI-BRANCH (Học từ GrabFood)

#### 2.2.1 Phân tích từ GrabFood

**GrabFood Multi-Branch System:**
- Menu Group: Share menu cho tối đa 50 chi nhánh
- Centralized Dashboard: Xem tổng doanh thu tất cả chi nhánh
- Role Management: Brand Owner, Branch Manager, Staff
- Campaign Management: Chạy campaign cho nhiều chi nhánh cùng lúc

#### 2.2.2 Thiết kế cho FaB-O2O

**A. KIẾN TRÚC MULTI-BRANCH**

```
BRAND (Highland Coffee)
├─ brand_id: "BRD001"
├─ brand_name: "Highland Coffee"
├─ brand_owner: owner@highland.com
├─ default_menu_template_id: "TMPL001"
├─ default_settings:
│  ├─ commission_rate: 20%
│  ├─ delivery_radius: 5km
│  └─ prep_time: 15 phút
│
├─ BRANCH 1 (Highland Q1)
│  ├─ branch_id: "MER001"
│  ├─ branch_name: "Highland Quận 1"
│  ├─ branch_manager: manager.q1@highland.com
│  ├─ address: "123 Nguyễn Huệ, Q1"
│  ├─ location: {lat: 10.7769, lon: 106.7009}
│  ├─ menu_source: "use_template" (sync tự động)
│  ├─ operating_hours: "06:00-22:00"
│  ├─ status: "active"
│  └─ settings_override:
│     ├─ custom_prep_time: 20 phút (override default)
│     └─ custom_delivery_radius: 3km
│
├─ BRANCH 2 (Highland Q7)
│  ├─ branch_id: "MER002"
│  ├─ menu_source: "custom" (tùy chỉnh riêng)
│  ├─ operating_hours: "07:00-23:00"
│  └─ status: "active"
│
└─ BRANCH 3 (Highland Q10)
   ├─ branch_id: "MER003"
   ├─ menu_source: "use_template"
   ├─ operating_hours: "06:00-22:00"
   └─ status: "inactive"
```

**B. PHÂN QUYỀN (ROLE-BASED ACCESS CONTROL)**

**1. BRAND OWNER**
```
Permissions:
├─ Xem tất cả chi nhánh
├─ Tạo/Sửa/Xóa chi nhánh
├─ Quản lý Menu Template
│  ├─ Tạo/Sửa danh mục
│  ├─ Thêm/Sửa/Xóa món ăn
│  ├─ Update 1 lần → Sync toàn bộ chi nhánh
│  └─ Chi nhánh có thể override: Tạm ẩn món, Điều chỉnh giá
├─ Xem báo cáo tổng hợp toàn Brand
├─ Quản lý nhân viên toàn Brand
├─ Tạo campaign cho nhiều chi nhánh
└─ Cấu hình settings mặc định
```

**2. BRANCH MANAGER**
```
Permissions:
├─ Chỉ xem chi nhánh được gán
├─ Quản lý đơn hàng chi nhánh
│  ├─ Xác nhận/Từ chối đơn
│  ├─ Cập nhật trạng thái đơn
│  └─ Xem lịch sử đơn hàng
├─ Inventory Management
│  ├─ Bật/Tắt món (hết hàng)
│  └─ Điều chỉnh giá (nếu Brand Owner cho phép)
├─ Xem báo cáo chi nhánh
├─ Quản lý nhân viên chi nhánh
└─ Cập nhật giờ mở cửa
```

**3. BRANCH STAFF**
```
Permissions:
├─ Xem đơn hàng
├─ Xác nhận/Từ chối đơn
└─ Cập nhật trạng thái đơn
```

**C. MENU MANAGEMENT**

**Option 1: Menu Template (Recommended)**
```
Flow:
1. Brand Owner tạo Menu Template
2. Tất cả chi nhánh dùng chung template
3. Brand Owner update món → Auto sync toàn bộ chi nhánh
4. Branch Manager có thể:
   ├─ Tạm ẩn món (hết hàng tạm thời)
   └─ Điều chỉnh giá (nếu được phép)
```

**Option 2: Custom Menu**
```
Flow:
1. Chi nhánh tự quản lý menu riêng
2. Không sync với Brand Template
3. Phù hợp cho chi nhánh có menu đặc biệt
```

**D. DASHBOARD BRAND OWNER**

```
┌─────────────────────────────────────────────────────────┐
│              TỔNG QUAN TOÀN BRAND                        │
├─────────────────────────────────────────────────────────┤
│ Tổng doanh thu:        5,000,000đ                       │
│ Tổng đơn hàng:         250 đơn                          │
│ Đánh giá trung bình:   4.5 ⭐                            │
│ Số chi nhánh active:   2/3                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           PERFORMANCE TỪNG CHI NHÁNH                     │
├──────────────┬──────────┬──────────┬──────────┬─────────┤
│ Chi nhánh    │ Doanh thu│ Đơn hàng │ Rating   │ Status  │
├──────────────┼──────────┼──────────┼──────────┼─────────┤
│ Highland Q1  │ 2,000k   │ 100      │ 4.6 ⭐   │ 🟢 Open │
│ Highland Q7  │ 1,800k   │ 90       │ 4.5 ⭐   │ 🟢 Open │
│ Highland Q10 │ 1,200k   │ 60       │ 4.3 ⭐   │ 🔴 Close│
└──────────────┴──────────┴──────────┴──────────┴─────────┘

┌─────────────────────────────────────────────────────────┐
│              MÓN BÁN CHẠY TOÀN BRAND                     │
├─────────────────────────────────────────────────────────┤
│ 1. Phin Sữa Đá        - 150 đơn                         │
│ 2. Bạc Xỉu            - 120 đơn                         │
│ 3. Cà Phê Đen         - 100 đơn                         │
└─────────────────────────────────────────────────────────┘
```

---

### 2.3 MERCHANT PARTNERSHIP PROGRAM (Học từ ShopeeFood)

#### 2.3.1 Phân tích từ ShopeeFood & GrabFood

**ShopeeFood Preferred Merchant:**
- Badge "Preferred" trên app
- Tăng visibility (hiển thị ưu tiên)
- Commission rate ưu đãi
- Dedicated support

**GrabFood Preferred Partner:**
- Priority delivery
- Exclusive promotions
- Enhanced app features

#### 2.3.2 Thiết kế MERCHANT TIER SYSTEM

**A. REGULAR MERCHANT**
```
Điều kiện:
- Mới đăng ký hoặc chưa đủ tiêu chí lên tier cao

Lợi ích:
├─ Commission: 20%
├─ Support: Email (48h response)
└─ Hiển thị: Bình thường trên app
```

**B. PREFERRED MERCHANT ⭐**
```
Điều kiện (đạt TẤT CẢ):
├─ Hoạt động ≥ 3 tháng
├─ Rating ≥ 4.5 ⭐
├─ Tổng số đơn ≥ 500
├─ Acceptance rate ≥ 95%
├─ Cancellation rate ≤ 2%
└─ Avg prep time ≤ 20 phút

Lợi ích:
├─ Badge "Preferred" ⭐ trên app
├─ Hiển thị ưu tiên trong search results
├─ Xuất hiện trong "Top Picks" section
├─ Commission: 18% (giảm 2%)
├─ Support: Chat (4h response)
├─ Được tham gia Platform Campaign
└─ Weekly performance report
```

**C. PREMIUM PARTNER 👑**
```
Điều kiện (đạt TẤT CẢ):
├─ Hoạt động ≥ 6 tháng
├─ Rating ≥ 4.7 ⭐
├─ Tổng số đơn ≥ 2000
├─ Acceptance rate ≥ 98%
├─ Cancellation rate ≤ 1%
├─ Avg prep time ≤ 15 phút
└─ Multi-branch ≥ 3 chi nhánh

Lợi ích:
├─ Badge "Premium Partner" 👑 trên app
├─ TOP đầu trong search results
├─ Featured trong Home banner
├─ Commission: 15% (giảm 5%)
├─ Dedicated Account Manager
├─ Priority trong Platform Campaign
├─ Co-marketing opportunities
├─ Custom analytics dashboard
└─ Flexible payment terms (weekly payout)
```

**D. AUTO TIER EVALUATION**
```
Job Schedule:
├─ Chạy: Chủ Nhật 3:00 AM hàng tuần
├─ Đánh giá: Performance 30 ngày gần nhất
├─ Action: Tự động upgrade/downgrade tier
└─ Notification: Gửi email thông báo cho Merchant

Evaluation Logic:
1. Lấy metrics 30 ngày gần nhất
2. Check điều kiện từng tier (từ cao xuống thấp)
3. Nếu đạt Premium → Upgrade to Premium
4. Nếu không đạt Premium nhưng đạt Preferred → Upgrade to Preferred
5. Nếu không đạt cả 2 → Downgrade to Regular
6. Update merchant.tier trong database
7. Gửi email thông báo
```

---

### 2.4 FLASH SALE & DEAL RECOMMENDATION

#### 2.4.1 Phân tích từ ShopeeFood

**ShopeeFood Day (20-21 hàng tháng):**
- Flash Sale 99% off
- Countdown timer
- Số lượng có hạn
- First come first serve

**Deal Recommendation Sections:**
- "Deal Ngon" section
- "Flash Sale" section
- "Freeship Xtra" section

#### 2.4.2 Thiết kế DEAL RECOMMENDATION ENGINE

**A. SCORING FORMULA**
```
final_score = 
  + discount_score × 0.3        (deal càng tốt càng cao)
  + distance_score × 0.25       (càng gần càng cao)
  + popularity_score × 0.2      (đơn nhiều càng cao)
  + rating_score × 0.15         (rating cao càng cao)
  + time_relevance_score × 0.1  (phù hợp giờ ăn)
```

**B. CHI TIẾT SCORING**

**1. Discount Score (0-100)**
```
- Flash Sale 50%+:    100 điểm
- Freeship:           80 điểm
- Giảm 30-50%:        70 điểm
- Giảm 10-30%:        50 điểm
- Giảm <10%:          30 điểm
```

**2. Distance Score (0-100)**
```
- 0-1km:    100 điểm
- 1-2km:    80 điểm
- 2-3km:    60 điểm
- 3-5km:    40 điểm
- >5km:     20 điểm
```

**3. Popularity Score (0-100)**
```
Dựa trên số đơn 24h gần nhất:
- Top 10%:  100 điểm
- Top 25%:  80 điểm
- Top 50%:  60 điểm
- Còn lại:  40 điểm
```

**4. Rating Score (0-100)**
```
- 4.8-5.0:  100 điểm
- 4.5-4.7:  80 điểm
- 4.0-4.4:  60 điểm
- 3.5-3.9:  40 điểm
- <3.5:     20 điểm
```

**5. Time Relevance Score (0-100)**
```
Match với time_bucket:
- Breakfast (6-10h): Cà phê, Bánh mì → 100
- Lunch (10-14h): Cơm, Bún → 100
- Afternoon (14-17h): Trà sữa, Snack → 100
- Dinner (17-21h): Cơm, Lẩu → 100
- Late night (21-24h): Ăn vặt, Đồ nướng → 100
- Không match: 50 điểm
```

**C. UI DISPLAY**

```
Home Screen Sections:

┌─────────────────────────────────────────────────────────┐
│ 🔥 FLASH SALE - KẾT THÚC TRONG 02:34:15                 │
├─────────────────────────────────────────────────────────┤
│ [Quán A - 99% OFF] [Quán B - 50% OFF] [Quán C - Free]  │
│ Còn: 45/100        Còn: 120/500       Còn: 30/200       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 💎 DEAL NGON HÔM NAY                                     │
├─────────────────────────────────────────────────────────┤
│ [Quán D - Giảm 50k] [Quán E - Freeship] ...            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🚚 FREESHIP XTRA                                         │
├─────────────────────────────────────────────────────────┤
│ [Quán F] [Quán G] [Quán H] ...                         │
└─────────────────────────────────────────────────────────┘
```

---

### 2.5 AI RECOMMENDATION ENGINE (Chi tiết Training Pipeline)

#### 2.5.1 Model Selection

**Chọn: Alternating Least Squares (ALS)**
- Lý do: Phù hợp cho implicit feedback (view, cart, order)
- Ưu điểm: Scalable, hiệu quả với sparse matrix
- Thư viện: PySpark MLlib

#### 2.5.2 Training Pipeline (5 Bước Chi Tiết)

**STEP 1: Data Collection & Preprocessing**
```python
# 1.1 Extract Data từ MongoDB
time_window = 60  # ngày
query = {
  "timestamp": {"$gte": now - timedelta(days=time_window)},
  "action": {"$in": ["view_product", "add_to_cart", "order_completed", "rate"]}
}
data = db.user_interactions.find(query)

# 1.2 Transform to Rating Matrix
# user_id | item_id | implicit_rating | timestamp
# U001    | P123    | 5 (order)       | 2026-01-10
# U001    | P456    | 3 (add_cart)    | 2026-01-09
# U002    | P123    | 2 (view)        | 2026-01-08

# 1.3 Data Cleaning
- Remove spam users (>100 orders/day)
- Remove test accounts
- Remove deleted items

# 1.4 Train/Test Split
- Train: 80% (dữ liệu cũ hơn)
- Test: 20% (dữ liệu mới hơn - time-based split)
```

**STEP 2: Model Training (ALS)**
```python
from pyspark.ml.recommendation import ALS

# Hyperparameters
model = ALS(
  rank=50,              # số latent factors
  maxIter=20,           # số iterations
  regParam=0.01,        # lambda (regularization)
  alpha=40,             # confidence weight cho implicit feedback
  implicitPrefs=True,   # dùng implicit feedback
  coldStartStrategy="drop"
)

# Training Process
# 1. Initialize user & item matrices randomly
# 2. Fix item matrix, optimize user matrix
# 3. Fix user matrix, optimize item matrix
# 4. Repeat steps 2-3 for 20 iterations
# 5. Converge to optimal matrices

# Output
# - User Matrix: [num_users × 50]
# - Item Matrix: [num_items × 50]

# Prediction
# score(user, item) = user_vector · item_vector
```

**STEP 3: Model Evaluation**
```python
# Metrics
metrics = {
  "precision@10": 0.18,  # Target: ≥ 0.15
  "recall@10": 0.28,     # Target: ≥ 0.25
  "ndcg@10": 0.32,       # Target: ≥ 0.30
  "coverage": 0.45       # Target: ≥ 0.40
}

# Nếu metrics đạt target → Deploy
# Nếu không → Tune hyperparameters → Retrain
```

**STEP 4: Generate Recommendations**
```python
# For each user:
for user in all_users:
  # 1. Tính score cho TẤT CẢ items
  scores = model.recommendForUsers(user, num_items=1000)
  
  # 2. Loại items đã order trong 7 ngày
  scores = filter_recent_orders(scores, user, days=7)
  
  # 3. Loại items không available
  scores = filter_unavailable(scores)
  
  # 4. Sort by score DESC
  scores = scores.sort_values('score', ascending=False)
  
  # 5. Take top 100
  top_100 = scores.head(100)
  
  # 6. Save to Redis
  save_to_redis(user, top_100, version="v20260112")
```

**STEP 5: Deploy to Redis**
```python
# Version Strategy
version = f"v{datetime.now().strftime('%Y%m%d')}"  # v20260112

# Redis Keys
redis.zadd(f"reco:prod:{user_id}:{version}", {
  "P123": 0.95,
  "P456": 0.89,
  ...
  "P999": 0.45  # top 100
})

redis.hset(f"reco:meta:{user_id}", mapping={
  "current_version": version,
  "generated_at": "2026-01-12 02:30:00",
  "model_metrics": json.dumps(metrics)
})

# TTL: 14 days (2× training cycle)
redis.expire(f"reco:prod:{user_id}:{version}", 14 * 24 * 3600)
```

#### 2.5.3 Data Retention Strategy (Xử lý dữ liệu cũ)

**MongoDB (user_interactions)**

```
HOT DATA (0-90 ngày):
├─ Dùng cho: Training model
├─ Storage: MongoDB primary collection
├─ Index: Indexed, query nhanh
└─ Partition: By month

WARM DATA (90-365 ngày):
├─ Dùng cho: Analysis, reporting (KHÔNG dùng training)
├─ Storage: MongoDB archive collection (user_interactions_archive)
├─ Query: Có thể query nhưng chậm hơn
└─ Action: Auto archive job hàng tháng

COLD DATA (>365 ngày):
├─ Dùng cho: Audit, compliance only
├─ Storage: Export sang S3/Cloud Storage
├─ Query: Không query trực tiếp
└─ Action: Export rồi xóa khỏi MongoDB
```

**Lý do chỉ dùng 60-90 ngày cho training:**
1. User preference thay đổi theo thời gian
2. Món mới/quán mới cần được recommend
3. Training nhanh hơn (ít data hơn)
4. Model không bị bias bởi data cũ

#### 2.5.4 Online Serving (Real-time)

```python
# Input
request = {
  "user_id": "U001",
  "current_location": {"lat": 10.762622, "lon": 106.660172},
  "time_bucket": "lunch",  # morning/lunch/dinner/late_night
  "device_language": "vi"
}

# Flow
# 1. Fetch candidates từ Redis
version = redis.hget(f"reco:meta:{user_id}", "current_version")
candidates = redis.zrange(f"reco:prod:{user_id}:{version}", 0, 99, desc=True, withscores=True)

# 2. Hard Filters (bắt buộc đúng thực tế)
candidates = filter_by([
  merchant.status == "approved",
  merchant.is_accepting_orders == True,
  merchant.is_open_now() == True,
  product.is_active == True,
  product.is_available == True,
  distance(merchant, user_location) <= delivery_radius
])

# 3. Boost / Re-rank theo context
for item in candidates:
  boost_score = 0
  
  # Time-of-day boost
  if time_bucket == "morning" and item.category == "coffee":
    boost_score += 0.2
  elif time_bucket == "lunch" and item.category == "rice":
    boost_score += 0.2
  
  # Distance boost
  distance_km = calculate_distance(item, user_location)
  if distance_km < 1:
    boost_score += 0.15
  elif distance_km < 2:
    boost_score += 0.10
  
  # Promotion boost
  if item.has_promotion:
    boost_score += 0.1
  
  item.final_score = item.score * (1 + boost_score)

# 4. Diversity / Exploration
top_10 = candidates[:10]  # Giữ top 10 ổn định
rest = shuffle(candidates[10:40])  # Shuffle phần còn lại
final_list = top_10 + rest

# 5. Fallback nếu candidate rỗng
if len(final_list) == 0:
  final_list = get_fallback_recommendations(user_location, time_bucket)

return final_list
```

---

### 2.6 SEARCH OPTIMIZATION (Elasticsearch Strategy)

#### 2.6.1 Technology Stack

```
MongoDB → Kafka (CDC) → Elasticsearch
- Real-time sync khi có thay đổi
- Debezium Change Data Capture
```

#### 2.6.2 Elasticsearch Index Setup

**Merchant Index:**
```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "vietnamese_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "asciifolding",        // bún → bun
            "edge_ngram_filter",   // autocomplete
            "synonym_filter"
          ]
        }
      },
      "filter": {
        "edge_ngram_filter": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 10
        },
        "synonym_filter": {
          "type": "synonym",
          "synonyms": [
            "cơm, com, rice",
            "bún, bun, noodle",
            "phở, pho",
            "cà phê, ca phe, coffee, cf",
            "trà sữa, tra sua, milk tea",
            "bánh mì, banh mi, bread"
          ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "merchant_id": {"type": "keyword"},
      "name": {
        "type": "text",
        "analyzer": "vietnamese_analyzer",
        "fields": {
          "keyword": {"type": "keyword"},
          "suggest": {
            "type": "completion",
            "analyzer": "vietnamese_analyzer"
          }
        }
      },
      "cuisine_type": {"type": "text", "analyzer": "vietnamese_analyzer"},
      "location": {"type": "geo_point"},
      "rating": {"type": "float"},
      "total_orders": {"type": "integer"},
      "is_open": {"type": "boolean"},
      "tier": {"type": "keyword"}
    }
  }
}
```

#### 2.6.3 Search Features

**1. Autocomplete (Search-as-you-type)**
```
User gõ: "pho"

Query:
{
  "suggest": {
    "merchant-suggest": {
      "prefix": "pho",
      "completion": {
        "field": "name.suggest",
        "fuzzy": {"fuzziness": 1},
        "size": 10
      }
    }
  }
}

Result:
- Phở Hà Nội
- Phở 24
- Phở Thin
```

**2. Full Search (Multi-field + Fuzzy + Geo)**
```
User search: "com tam gan"
Location: (10.762622, 106.660172)

Scoring Formula:
final_score = text_relevance × (
  + distance_boost × 2
  + rating_boost × 1.2
  + popularity_boost × 0.1
  + tier_boost × 1.5 (nếu Premium)
)
```

**3. Typo Tolerance (Fuzzy Search)**
```
User gõ: "restaurnt" (sai chính tả)
Result: "restaurant" (tự động sửa)

Fuzziness levels:
- 1-2 characters: fuzziness = 0
- 3-5 characters: fuzziness = 1
- 6+ characters: fuzziness = 2
```

**4. Synonym Handling**
```
User search: "cf"
Elasticsearch expands: "cf" OR "coffee" OR "cà phê" OR "ca phe"
```

#### 2.6.4 Search Analytics

```javascript
// Track mỗi search query
{
  search_query: "pho ga",
  user_id: "U001",
  timestamp: "2026-01-11T10:30:00Z",
  num_results: 15,
  clicked_result: "M123",  // nếu có
  clicked_position: 3,      // vị trí thứ 3
  filters_applied: {
    rating: ">=4.5",
    distance: "<=3km"
  }
}

// Metrics
- Top search queries
- Zero-result queries (cần thêm synonym)
- Click-through rate by position
- Average position of clicked results

// Optimization
- Queries không có kết quả → thêm synonym
- Queries có kết quả nhưng không click → cải thiện ranking
- Popular queries → cache kết quả (Redis, TTL 5-10 phút)
```

---

## 3. CÁC TÁC NHÂN (ACTORS)

| Tác nhân | Nền tảng | Mô tả |
|----------|----------|-------|
| Khách hàng (Customer) | Mobile App | Người đặt đồ ăn, gọi xe, đặt món tại quán |
| Tài xế (Driver) | Mobile App | Người giao đồ ăn, chở khách |
| Chủ quán (Merchant) | Web App | Người quản lý quán, menu, đơn hàng |
| Quản trị viên (Admin) | Web App | Người quản lý toàn hệ thống |

---

## 3. CHỨC NĂNG CHI TIẾT

### 3.1 KHÁCH HÀNG (Customer App)

#### 3.1.1 Đăng ký & Đăng nhập
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| C-AUTH-01 | Đăng ký bằng SĐT | Nhập SĐT → Nhận OTP → Xác thực → Tạo tài khoản |
| C-AUTH-02 | Đăng nhập bằng SĐT | Nhập SĐT → OTP → Vào app |
| C-AUTH-03 | Đăng nhập Google | OAuth2 với Google |
| C-AUTH-04 | Đăng nhập Facebook | OAuth2 với Facebook |
| C-AUTH-05 | Quản lý hồ sơ | Sửa tên, avatar, email, địa chỉ mặc định |
| C-AUTH-06 | Quản lý địa chỉ | Thêm/Sửa/Xóa địa chỉ giao hàng |

#### 3.1.2 Trang chủ & Khám phá
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| C-HOME-01 | Hiển thị banner khuyến mãi | Slide banner từ Admin/Merchant |
| C-HOME-02 | Danh sách quán gần đây | Quán đã đặt gần nhất |
| C-HOME-03 | Gợi ý "Dành cho bạn" | AI đề xuất món/quán dựa trên lịch sử |
| C-HOME-04 | Danh mục món ăn | Cơm, Bún, Trà sữa, Coffee... |
| C-HOME-05 | Tìm kiếm | Tìm theo tên quán, tên món |
| C-HOME-06 | Tìm kiếm thông minh | AI search theo ngữ nghĩa |
| C-HOME-07 | Lọc kết quả | Theo khoảng cách, đánh giá, giá |

#### 3.1.3 Đặt đồ ăn (Food Delivery)
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| C-FOOD-01 | Xem chi tiết quán | Thông tin quán, giờ mở cửa, rating |
| C-FOOD-02 | Xem menu | Danh sách món theo danh mục |
| C-FOOD-03 | Xem chi tiết món | Mô tả, hình ảnh, giá, topping |
| C-FOOD-04 | Chọn topping/option | Size, đường, đá, thêm topping |
| C-FOOD-05 | Thêm vào giỏ hàng | Thêm món với số lượng |
| C-FOOD-06 | Xem giỏ hàng | Danh sách món đã chọn, tổng tiền |
| C-FOOD-07 | Áp mã giảm giá | Nhập/Chọn voucher |
| C-FOOD-08 | Chọn địa chỉ giao | Địa chỉ đã lưu hoặc nhập mới |
| C-FOOD-09 | Xem phí vận chuyển | Tính theo khoảng cách |
| C-FOOD-10 | Đặt hàng | Xác nhận và gửi đơn |
| C-FOOD-11 | Theo dõi đơn hàng | Trạng thái: Đang xử lý → Đang nấu → Đang giao → Hoàn thành |
| C-FOOD-12 | Theo dõi vị trí tài xế | Bản đồ realtime |
| C-FOOD-13 | Chat với tài xế | Nhắn tin trong đơn hàng |
| C-FOOD-14 | Gọi điện tài xế | Gọi điện trực tiếp |
| C-FOOD-15 | Đánh giá đơn hàng | Rating 1-5 sao + comment |

#### 3.1.4 Đặt xe (Ride-hailing)
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| C-RIDE-01 | Chọn điểm đón | Vị trí hiện tại hoặc chọn trên bản đồ |
| C-RIDE-02 | Chọn điểm đến | Nhập địa chỉ hoặc chọn trên bản đồ |
| C-RIDE-03 | Xem giá ước tính | Hiển thị giá trước khi đặt |
| C-RIDE-04 | Chọn loại xe | Xe máy / Ô tô |
| C-RIDE-05 | Đặt xe | Xác nhận và tìm tài xế |
| C-RIDE-06 | Theo dõi tài xế đón | Vị trí tài xế trên bản đồ |
| C-RIDE-07 | Theo dõi hành trình | Lộ trình di chuyển |
| C-RIDE-08 | Chat/Gọi tài xế | Liên hệ tài xế |
| C-RIDE-09 | Thanh toán | Online hoặc tiền mặt |
| C-RIDE-10 | Đánh giá chuyến đi | Rating 1-5 sao |

#### 3.1.5 Đặt món tại quán (Dine-in QR)
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| C-DINE-01 | Mở scanner trong app | Camera quét QR |
| C-DINE-02 | Quét mã QR bàn | Nhận diện quán + số bàn |
| C-DINE-03 | Xem menu của quán | Menu riêng cho dine-in |
| C-DINE-04 | Chọn món & topping | Giống flow đặt đồ ăn |
| C-DINE-05 | Gửi order đến bếp | Đơn hàng hiển thị cho Merchant |
| C-DINE-06 | Thanh toán | Thanh toán online ngay |
| C-DINE-07 | Gọi thêm món | Thêm món vào đơn đang mở |

#### 3.1.6 Thanh toán
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| C-PAY-01 | Thanh toán VNPay | QR hoặc app VNPay |
| C-PAY-02 | Thanh toán MoMo | Chuyển sang app MoMo |
| C-PAY-03 | Thanh toán ZaloPay | Chuyển sang app ZaloPay |
| C-PAY-04 | Thanh toán tiền mặt | COD (chỉ cho Delivery/Ride) |

#### 3.1.7 Khác
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| C-OTHER-01 | Xem lịch sử đơn hàng | Danh sách đơn đã đặt |
| C-OTHER-02 | Đặt lại đơn cũ | Tái tạo đơn từ lịch sử |
| C-OTHER-03 | Ví voucher | Danh sách mã giảm giá đang có |
| C-OTHER-04 | Thông báo | Push notification |
| C-OTHER-05 | Đa ngôn ngữ | Tiếng Việt / English |

---

### 3.2 TÀI XẾ (Driver App)

#### 3.2.1 Đăng ký & Xác thực
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| D-AUTH-01 | Đăng ký tài khoản | Nhập thông tin cá nhân |
| D-AUTH-02 | Upload hồ sơ | CMND/CCCD, Bằng lái, Ảnh xe |
| D-AUTH-03 | Chờ duyệt | Trạng thái: Pending → Approved/Rejected |
| D-AUTH-04 | Đăng nhập | SĐT + OTP |

#### 3.2.2 Chế độ hoạt động
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| D-MODE-01 | Bật/Tắt nhận đơn | Online/Offline |
| D-MODE-02 | Toggle Giao đồ ăn | Bật/Tắt nhận đơn Food |
| D-MODE-03 | Toggle Chở khách | Bật/Tắt nhận đơn Ride |
| D-MODE-04 | Bật cả hai chế độ | Nhận cả Food và Ride |

**Logic khi bật cả 2:**
- Đang chờ: Nhận request từ cả 2 loại
- Nhận chở khách → Tạm khóa Food
- Nhận giao đồ ăn → Khóa Ride, MỞ gộp đơn Food

#### 3.2.3 Nhận đơn giao đồ ăn
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| D-FOOD-01 | Nhận thông báo đơn mới | Push + Sound |
| D-FOOD-02 | Xem chi tiết đơn | Quán, món, địa chỉ khách |
| D-FOOD-03 | Chấp nhận/Từ chối | Trong thời gian đếm ngược |
| D-FOOD-04 | Dẫn đường đến quán | Bản đồ + navigation |
| D-FOOD-05 | Xác nhận đến quán | Check-in |
| D-FOOD-06 | Xác nhận lấy hàng | Đã nhận đồ ăn |
| D-FOOD-07 | Dẫn đường đến khách | Navigation |
| D-FOOD-08 | Xác nhận giao hàng | Hoàn thành đơn |
| D-FOOD-09 | Thu tiền COD | Nếu khách trả tiền mặt |

#### 3.2.4 Gộp đơn (Order Batching)
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| D-BATCH-01 | Nhận đề xuất đơn ghép | Đơn thứ 2 thuận đường |
| D-BATCH-02 | Xem lộ trình tối ưu | Quán A → Quán B → Khách A → Khách B |
| D-BATCH-03 | Chấp nhận/Từ chối ghép | Tự quyết định |

#### 3.2.5 Nhận cuốc chở khách
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| D-RIDE-01 | Nhận thông báo cuốc xe | Push + Sound |
| D-RIDE-02 | Xem thông tin khách | Điểm đón, điểm đến, giá |
| D-RIDE-03 | Chấp nhận/Từ chối | Trong thời gian đếm ngược |
| D-RIDE-04 | Dẫn đường đến điểm đón | Navigation |
| D-RIDE-05 | Xác nhận đón khách | Bắt đầu chuyến |
| D-RIDE-06 | Dẫn đường đến điểm đến | Navigation |
| D-RIDE-07 | Kết thúc chuyến | Hoàn thành |

#### 3.2.6 Ví & Thu nhập
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| D-WALLET-01 | Xem thu nhập hôm nay | Tổng tiền kiếm được |
| D-WALLET-02 | Xem thu nhập theo tuần/tháng | Thống kê |
| D-WALLET-03 | Lịch sử giao dịch | Chi tiết từng đơn |
| D-WALLET-04 | Rút tiền | Chuyển về tài khoản ngân hàng |

---

### 3.3 CHỦ QUÁN (Merchant Web)

#### 3.3.1 Đăng ký & Onboarding
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| M-AUTH-01 | Đăng ký quán | Thông tin quán + Giấy phép kinh doanh |
| M-AUTH-02 | Chờ Admin duyệt | Trạng thái Pending |
| M-AUTH-03 | Nhận tài khoản | Email thông báo + credentials |
| M-AUTH-04 | Đăng nhập | Email + Password |
| M-AUTH-05 | Setup ban đầu | Cập nhật thông tin, logo, giờ mở cửa |

#### 3.3.2 Quản lý Menu
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| M-MENU-01 | Tạo danh mục | Cơm, Bún, Đồ uống... |
| M-MENU-02 | Thêm món ăn | Tên, mô tả, giá, hình ảnh |
| M-MENU-03 | Quản lý Topping | Thêm cheese +10k, Thêm trứng +5k |
| M-MENU-04 | Quản lý Option | Size S/M/L, Đường 0/30/50/100% |
| M-MENU-05 | Đánh dấu hết hàng | Tạm ẩn món |
| M-MENU-06 | Sắp xếp thứ tự | Kéo thả món/danh mục |

#### 3.3.3 Quản lý Đơn hàng
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| M-ORDER-01 | Danh sách đơn mới | Realtime notification |
| M-ORDER-02 | Xác nhận đơn | Bấm nhận đơn |
| M-ORDER-03 | Từ chối đơn | Lý do: Hết nguyên liệu, Quá tải... |
| M-ORDER-04 | Báo đang làm | Cập nhật trạng thái |
| M-ORDER-05 | Báo sẵn sàng | Thông báo tài xế đến lấy |
| M-ORDER-06 | Xem đơn Dine-in | Đơn từ khách quét QR tại bàn |
| M-ORDER-07 | Lịch sử đơn hàng | Đơn đã hoàn thành |

#### 3.3.4 Quản lý Bàn (QR Dine-in)
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| M-TABLE-01 | Tạo bàn | Bàn 1, Bàn 2... |
| M-TABLE-02 | Tạo mã QR cho bàn | In QR để dán lên bàn |
| M-TABLE-03 | Xem trạng thái bàn | Đang có khách / Trống |

#### 3.3.5 Khuyến mãi (Voucher)
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| M-PROMO-01 | Tạo mã giảm giá | Giảm %, Giảm tiền, Freeship |
| M-PROMO-02 | Đặt điều kiện | Đơn tối thiểu, Số lượng sử dụng |
| M-PROMO-03 | Bật/Tắt khuyến mãi | Active/Inactive |

#### 3.3.6 Báo cáo
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| M-REPORT-01 | Doanh thu theo ngày/tuần/tháng | Biểu đồ |
| M-REPORT-02 | Món bán chạy | Top sản phẩm |
| M-REPORT-03 | Đánh giá từ khách | Danh sách review |

#### 3.3.7 Quản lý Chi nhánh (Branch Management - V1)
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| M-BRANCH-01 | Tạo chi nhánh (Draft) | Owner tạo chi nhánh ở trạng thái DRAFT để setup thông tin, giờ mở cửa, vị trí, menu |
| M-BRANCH-02 | Gửi duyệt chi nhánh | Upload giấy tờ + ảnh mặt tiền + địa chỉ → chuyển trạng thái PENDING_REVIEW |
| M-BRANCH-03 | Xem trạng thái duyệt | Owner xem: DRAFT / PENDING_REVIEW / ACTIVE / REJECTED (kèm lý do) |
| M-BRANCH-04 | Cập nhật thông tin chi nhánh | Chỉ cho phép sửa khi DRAFT hoặc REJECTED; nếu ACTIVE sửa thông tin nhạy cảm → yêu cầu duyệt lại (optional) |
| M-BRANCH-05 | Bật/Tắt nhận đơn chi nhánh | Owner/Manager được bật/tắt trạng thái nhận đơn (is_accepting_orders) |

#### 3.3.8 Quản lý Nhân sự & Phân quyền (Team & RBAC - V1)
**Role V1:**
- OWNER: toàn quyền trong merchant (tất cả chi nhánh)
- MANAGER: quản lý 1 chi nhánh được gán
- STAFF: xử lý đơn trong 1 chi nhánh được gán

| ID | Chức năng | Mô tả |
|----|-----------|-------|
| M-TEAM-01 | Tạo tài khoản nhân sự | Owner tạo account cho Manager/Staff, gán role + gán chi nhánh |
| M-TEAM-02 | Danh sách nhân sự | Owner xem tất cả chi nhánh; Manager chỉ xem nhân sự trong chi nhánh mình |
| M-TEAM-03 | Khóa/Mở tài khoản | Owner khóa/mở tài khoản nhân sự (phòng nghỉ việc, vi phạm) |
| M-TEAM-04 | Reset mật khẩu | Owner reset mật khẩu cho nhân sự |
| M-TEAM-05 | Gán/đổi chi nhánh | Owner đổi nhân sự sang chi nhánh khác (re-assign) |
| M-TEAM-06 | Audit log | Lưu vết: ai cập nhật trạng thái đơn, ai sửa menu, ai bật/tắt nhận đơn |
---

### 3.4 QUẢN TRỊ VIÊN (Admin Web)

#### 3.4.1 Dashboard
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| A-DASH-01 | Tổng quan hệ thống | Số đơn, doanh thu, user active |
| A-DASH-02 | Biểu đồ realtime | Đơn hàng theo giờ |

#### 3.4.2 Quản lý Merchant
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| A-MERC-01 | Danh sách Merchant | Tất cả quán đã đăng ký |
| A-MERC-02 | Duyệt Merchant mới | Approve/Reject |
| A-MERC-03 | Xem chi tiết Merchant | Thông tin, doanh thu |
| A-MERC-04 | Block/Unblock Merchant | Tạm khóa quán vi phạm |

#### 3.4.3 Quản lý Driver
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| A-DRIV-01 | Danh sách Driver | Tất cả tài xế |
| A-DRIV-02 | Duyệt Driver mới | Kiểm tra hồ sơ, Approve/Reject |
| A-DRIV-03 | Block/Unblock Driver | Tạm khóa tài xế vi phạm |

#### 3.4.4 Quản lý User
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| A-USER-01 | Danh sách User | Tất cả khách hàng |
| A-USER-02 | Block/Unblock User | Khóa tài khoản vi phạm |

#### 3.4.5 Cấu hình hệ thống
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| A-CFG-01 | Cấu hình phí ship | Giá cơ bản, giá theo km |
| A-CFG-02 | Cấu hình % hoa hồng Merchant | Mặc định, có thể thay đổi |
| A-CFG-03 | Cấu hình % hoa hồng Driver | Mặc định, có thể thay đổi |
| A-CFG-04 | Quản lý danh mục | Thêm/Sửa/Xóa category |

#### 3.4.6 Khuyến mãi Platform
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| A-PROMO-01 | Tạo voucher toàn hệ thống | Áp dụng cho tất cả quán |
| A-PROMO-02 | Tạo banner quảng cáo | Hiển thị trên app |
| A-PROMO-03 | Popup khuyến mãi | Dialog khi mở app |

#### 3.4.7 Quản lý Thương hiệu (Brand - Multi-branch)
| ID | Chức năng | Mô tả |
|----|-----------|-------|
| A-BRAND-01 | Tạo Brand | Quán Bà Năm, Highland... |
| A-BRAND-02 | Gán Merchant vào Brand | Chi nhánh Q1, Q7... |
| A-BRAND-03 | Báo cáo tổng hợp Brand | Doanh thu tất cả chi nhánh |

---

## 4. HỆ THỐNG GỢI Ý AI (AI RECOMMENDATION)

### 4.1 Kiến trúc
```
┌─────────────────────┐      ┌─────────────────────┐
│    BATCH LAYER      │  +   │   REAL-TIME LAYER   │
│  (Train mỗi tuần)   │      │  (Xử lý mỗi request)│
└─────────────────────┘      └─────────────────────┘
         │                            │
         ▼                            ▼
    Model SVD                Filter + Boost + Shuffle
    (Học pattern)            (Điều chỉnh theo context)
         │                            │
         └────────────┬───────────────┘
                      ▼
              GỢI Ý CUỐI CÙNG
```

### 4.2 Thu thập dữ liệu
| Hành động | Điểm (Rating) |
|-----------|---------------|
| Đặt đơn thành công | 5 |
| Đánh giá 1-5 sao | 1-5 (explicit) |
| Thêm vào giỏ hàng | 3 |
| Xem chi tiết món | 2 |

### 4.3 Training
- **Thời gian:** 2:00 AM Chủ Nhật hàng tuần
- **Model:** Collaborative Filtering (SVD)
- **Output:** Top 100 món/quán cho mỗi user → Lưu Redis

### 4.4 Serving (Mỗi request)
1. Lấy danh sách gợi ý từ Redis
2. **Filter:** Loại món đã đặt trong 7 ngày
3. **Boost:** Tăng điểm theo giờ (sáng → cà phê, trưa → cơm)
4. **Shuffle:** Xáo trộn thứ tự mỗi lần load
5. **Fallback:** Nếu thiếu → bổ sung món phổ biến

### 4.5 Cold Start (User mới)
- Hiển thị món phổ biến theo khu vực

### 4.6 Mục tiêu
- Cá nhân hóa danh sách **món/quán** ở Home (“Dành cho bạn”) và các block gợi ý trong luồng Food.
- Kết quả phải tuân thủ **ràng buộc thực tế**: quán mở cửa/đang nhận đơn, món còn bán, trong bán kính giao, v.v.
- Ưu tiên **latency thấp**: cache-first, có fallback khi cache miss.
- V1 tập trung: “gợi ý ổn định + vận hành dễ + performance tốt”.

### 4.7 Kiến trúc (chuẩn production V1: Candidate Generation + Online Re-ranking)
Áp dụng kiến trúc 2-stage:
1) **Candidate Generation (Batch)**: tính danh sách ứng viên Top-K/user (offline).
2) **Online Re-ranking (Real-time)**: mỗi request sẽ lọc + điều chỉnh điểm theo ngữ cảnh và business constraints.
### 4.3 Thu thập dữ liệu (Tracking)
#### 4.3.1 Event & trọng số (implicit + explicit)
- view_product: 2
- add_to_cart: 3
- order_completed: 5
- rate: 1..5 (explicit)

#### 4.3.2 Trường dữ liệu tối thiểu
- user_id, item_type (product/merchant), item_id
- action, weight, timestamp
- context: source (home/search/reco), search_query (nếu có), geo_cell (khu vực)

#### 4.3.3 Nguồn lưu trữ
- MongoDB: `user_interactions`
- (Optional) Kafka topic `tracking.user_interaction.v1` để scale & realtime signals.

### 4.4 Batch Training (Candidate Generation)
- Lịch chạy V1: 02:00 AM Chủ Nhật hàng tuần (có thể nâng daily khi cần freshness).
- Training window: 60–90 ngày gần nhất.
- Model V1 được chọn:
  - **Implicit Matrix Factorization** (ví dụ ALS/BPR) trên dữ liệu implicit feedback (view/cart/order).
- Output:
  - Top-K products/user: (product_id, score)
  - Top-K merchants/user: (merchant_id, score)
  - Metadata: model_version, generated_at, training_window_days

#### 4.4.1 Lưu kết quả sang Redis (snapshot phục vụ nhanh)
- Redis lưu “recommendation snapshot” + version để serving low-latency.

Key đề xuất:
- `reco:prod:{user_id}:{model_version}` = ZSET(score -> product_id)
- `reco:mer:{user_id}:{model_version}`  = ZSET(score -> merchant_id)
- `reco:meta:{user_id}` = HASH { current_version, generated_at }

Chính sách:
- TTL snapshot: 8–14 ngày (>= chu kỳ retrain) để phòng job fail vẫn có dữ liệu cũ.
- Update atomic theo version:
  1) ghi ZSET version mới
  2) set `reco:meta:{user_id}.current_version` sang version mới

### 4.5 Online Serving (mỗi request)
Input:
- user_id, current_location, time_bucket (morning/lunch/dinner), device_language

Flow:
1) **Fetch candidates** từ Redis theo `current_version` (Top-K, ví dụ 100).
2) **Hard Filters (bắt buộc đúng thực tế)**:
   - Merchant: status=approved, is_accepting_orders=true, không bị deleted, đang trong giờ mở cửa.
   - Product: is_active=true, is_available=true, không deleted.
   - Distance/radius: trong phạm vi giao.
   - Rule hiện có: loại món đã đặt trong 7 ngày.
3) **Boost / Re-rank theo context (nhẹ, realtime)**:
   - Time-of-day boost (sáng/cafe, trưa/cơm…)
   - ETA/distance boost (gần hơn/ETA thấp hơn)
   - Promotion boost (freeship/discount)
   - (Optional V1.1) Boost theo recent signals (xem 4.6)
4) **Diversity / Exploration**:
   - giữ top N ổn định (ví dụ 10), phần còn lại shuffle nhẹ
   - hạn chế spam cùng merchant/category quá nhiều trong top list
5) **Fallback** nếu candidate rỗng hoặc cache miss (xem 4.7).

Output:
- Danh sách items kèm reason_tag (optional): based_on_history / popular_nearby / trending / promo_boost

### 4.6 Real-time signals (khuyến nghị V1.1 – không cần retrain)
Mục tiêu: giảm “cũ” của weekly model bằng tín hiệu gần đây.
- Lưu recent behavior vào Redis (TTL ngắn 1–3 ngày):
  - `rt:user:{user_id}:recent_categories` (ZSET timestamp)
  - `rt:user:{user_id}:recent_merchants`  (ZSET timestamp)
- Khi serving, boost nhẹ các item trùng category/merchant recent.

### 4.7 Cold Start & Fallback (chuẩn production V1)
Khi user mới / cache miss / candidate quá ít, ưu tiên fallback theo thứ tự:

1) **Popular near you**:
   - Top products/merchants theo geo_cell + time_bucket dựa trên order_completed.
2) **Trending 24h / 7d**:
   - items tăng nhanh theo khu vực.
3) **Top quality**:
   - top rated + đủ số review + tỉ lệ chuyển đổi tốt (nếu có).
4) **Editorial / Featured** (nếu Admin/Merchant có gắn featured).

Gợi ý cache:
- `fallback:popular:prod:{geo_cell}:{time_bucket}` = ZSET
- `fallback:popular:mer:{geo_cell}:{time_bucket}`  = ZSET
- TTL 1–6 giờ (tùy job cập nhật).

### 4.8 Vận hành & đo lường (tối thiểu)
- Log impression/click/order để đo CTR/CVR.
- Theo dõi cache_hit_rate, latency p95/p99.
- Model versioning + rollback.
---

## 5. NGHIỆP VỤ CHIA TIỀN (COMMISSION)

### 5.1 Công thức
```
Khách trả = Giá món + Phí ship + Phí dịch vụ - Voucher

Merchant nhận = Giá món × (100% - % Hoa hồng Merchant)
Driver nhận   = Phí ship × (100% - % Hoa hồng Driver)
Platform thu  = Hoa hồng Merchant + Hoa hồng Driver + Phí dịch vụ
```

### 5.2 Ví dụ
| Khoản | Số tiền |
|-------|---------|
| Giá món | 100,000đ |
| Phí ship | 20,000đ |
| Phí dịch vụ | 5,000đ |
| **Khách trả** | **125,000đ** |
| Merchant nhận (80%) | 80,000đ |
| Driver nhận (85%) | 17,000đ |
| **Platform thu** | **28,000đ** |

### 5.3 Loại Voucher
| Loại | Người tạo | Ai chịu chi phí |
|------|-----------|-----------------|
| Platform Voucher | Admin | Platform |
| Merchant Voucher | Merchant | Merchant |

---

## 6. ĐA NGÔN NGỮ (i18n)
- Hỗ trợ: Tiếng Việt (vi-VN), English (en-US)
- Mobile: Dùng thư viện localization
- Backend: Trả error code, App tự map text

---

## 7. PHASE TRIỂN KHAI

| Phase | Nội dung | Ưu tiên |
|-------|----------|---------|
| 1 | Core: Auth, Database, Project Setup | Cao |
| 2 | Merchant: Đăng ký, Menu, Order | Cao |
| 3 | Customer Food: Đặt món, Thanh toán | Cao |
| 4 | Driver Food: Nhận đơn, Giao hàng | Cao |
| 5 | Ride-hailing: Đặt xe, Chở khách | Cao |
| 6 | Dine-in QR: Quét mã, Đặt món tại bàn | Trung bình |
| 7 | AI: Gợi ý món, Tìm kiếm thông minh | Trung bình |
| 8 | Advanced: Chat, Smart Batching | Thấp |
