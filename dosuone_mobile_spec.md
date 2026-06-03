# DOSUONE PHONE STORE — Mobile App Technical Specification

> **Dành cho AI Agent** | Flutter Mobile + NestJS Backend + ReactJS Admin  
> Version 1.0 | 2025

---

## Stack công nghệ

| Thành phần | Công nghệ | Chi tiết |
|---|---|---|
| Mobile App | Flutter 3.x | Android & iOS |
| Backend API | NestJS (Node.js) | REST API + JWT Auth |
| Admin Panel | ReactJS | Quản lý sản phẩm & đơn hàng |
| Database | PostgreSQL | Local: localhost \| DB: dosuone |
| Auth | JWT + Refresh Token | Access: 15p, Refresh: 7 ngày |

---

## 1. CẤU HÌNH MÔI TRƯỜNG

File `.env` cho NestJS Backend:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<mật khẩu postgres local>
DB_NAME=dosuone

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

PORT=3000
```

---

## 2. DATABASE SCHEMA (PostgreSQL)

> Database: `dosuone` | Kết nối local: `localhost:5432` (user/password theo cấu hình máy)  
> Tất cả ID dùng UUID với `DEFAULT gen_random_uuid()`

### 2.1 Bảng `users`

| Column | Type | Constraints | Mô tả |
|---|---|---|---|
| id | UUID | PK, default gen_random_uuid() | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email đăng nhập |
| password | VARCHAR(255) | NOT NULL | Bcrypt hash |
| full_name | VARCHAR(100) | NOT NULL | Họ và tên |
| phone | VARCHAR(20) | NULLABLE | |
| avatar_url | TEXT | NULLABLE | |
| role | ENUM | DEFAULT 'customer' | `customer` \| `admin` |
| is_active | BOOLEAN | DEFAULT true | |
| refresh_token | TEXT | NULLABLE | Refresh token hiện tại |
| created_at | TIMESTAMP | DEFAULT now() | |
| updated_at | TIMESTAMP | DEFAULT now() | |

### 2.2 Bảng `categories`

| Column | Type | Constraints | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| name | VARCHAR(100) | NOT NULL | Apple, Samsung... |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL slug |
| image_url | TEXT | NULLABLE | |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMP | DEFAULT now() | |

### 2.3 Bảng `products`

| Column | Type | Constraints | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| category_id | UUID | FK categories.id | |
| name | VARCHAR(255) | NOT NULL | |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL slug |
| description | TEXT | NULLABLE | Mô tả chi tiết |
| price | DECIMAL(12,2) | NOT NULL | Giá gốc (VND) |
| sale_price | DECIMAL(12,2) | NULLABLE | Giá khuyến mãi |
| stock | INTEGER | DEFAULT 0 | Số lượng kho |
| brand | VARCHAR(100) | NULLABLE | |
| thumbnail_url | TEXT | NULLABLE | Ảnh chính |
| is_featured | BOOLEAN | DEFAULT false | Sản phẩm nổi bật |
| is_active | BOOLEAN | DEFAULT true | Đang bán |
| avg_rating | DECIMAL(3,2) | DEFAULT 0 | Điểm trung bình |
| review_count | INTEGER | DEFAULT 0 | Số lượng review |
| created_at | TIMESTAMP | DEFAULT now() | |
| updated_at | TIMESTAMP | DEFAULT now() | |

### 2.4 Bảng `product_images`

| Column | Type | Constraints | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| product_id | UUID | FK products.id, CASCADE | |
| image_url | TEXT | NOT NULL | |
| sort_order | INTEGER | DEFAULT 0 | Thứ tự ảnh |
| is_primary | BOOLEAN | DEFAULT false | Ảnh chính |

### 2.5 Bảng `product_specs`

| Column | Type | Constraints | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| product_id | UUID | FK products.id, CASCADE | |
| spec_key | VARCHAR(100) | NOT NULL | RAM, ROM, Pin... |
| spec_value | VARCHAR(255) | NOT NULL | 8GB, 256GB, 5000mAh... |
| sort_order | INTEGER | DEFAULT 0 | |

### 2.6 Bảng `addresses`

| Column | Type | Constraints | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK users.id, CASCADE | |
| full_name | VARCHAR(100) | NOT NULL | Tên người nhận |
| phone | VARCHAR(20) | NOT NULL | SĐT người nhận |
| province | VARCHAR(100) | NOT NULL | Tỉnh/Thành phố |
| district | VARCHAR(100) | NOT NULL | Quận/Huyện |
| ward | VARCHAR(100) | NOT NULL | Phường/Xã |
| address_detail | TEXT | NOT NULL | Số nhà, tên đường |
| is_default | BOOLEAN | DEFAULT false | Địa chỉ mặc định |

### 2.7 Bảng `orders`

| Column | Type | Constraints | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK users.id | |
| order_code | VARCHAR(20) | UNIQUE, NOT NULL | Mã đơn: DH20250001 |
| status | ENUM | NOT NULL | `pending` \| `confirmed` \| `shipping` \| `delivered` \| `cancelled` |
| payment_method | ENUM | NOT NULL | `cod` \| `bank_transfer` \| `momo` |
| payment_status | ENUM | DEFAULT 'unpaid' | `unpaid` \| `paid` \| `refunded` |
| subtotal | DECIMAL(12,2) | NOT NULL | Tổng tiền sản phẩm |
| shipping_fee | DECIMAL(12,2) | DEFAULT 0 | Phí ship |
| discount | DECIMAL(12,2) | DEFAULT 0 | Giảm giá |
| total | DECIMAL(12,2) | NOT NULL | Thanh toán |
| shipping_address | JSONB | NOT NULL | Snapshot địa chỉ giao hàng |
| note | TEXT | NULLABLE | Ghi chú đơn hàng |
| created_at | TIMESTAMP | DEFAULT now() | |
| updated_at | TIMESTAMP | DEFAULT now() | |

> **Quan trọng:** `shipping_address` là **JSONB snapshot** (không FK đến bảng addresses), vì user có thể xóa địa chỉ sau khi đặt hàng.

### 2.8 Bảng `order_items`

| Column | Type | Constraints | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| order_id | UUID | FK orders.id, CASCADE | |
| product_id | UUID | FK products.id | |
| product_name | VARCHAR(255) | NOT NULL | Snapshot tên sản phẩm |
| product_image | TEXT | NULLABLE | Snapshot ảnh |
| price | DECIMAL(12,2) | NOT NULL | Giá tại thời điểm mua |
| quantity | INTEGER | NOT NULL | |
| total | DECIMAL(12,2) | NOT NULL | price × quantity |

> **Quan trọng:** `product_name`, `product_image`, `price` là **snapshot** — không lấy lại từ bảng products.

### 2.9 Bảng `cart_items`

| Column | Type | Constraints | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK users.id, CASCADE | |
| product_id | UUID | FK products.id, CASCADE | |
| quantity | INTEGER | NOT NULL, DEFAULT 1 | |
| created_at | TIMESTAMP | DEFAULT now() | |

> UNIQUE constraint trên `(user_id, product_id)`

### 2.10 Bảng `reviews`

| Column | Type | Constraints | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| product_id | UUID | FK products.id, CASCADE | |
| user_id | UUID | FK users.id, CASCADE | |
| order_item_id | UUID | FK order_items.id, UNIQUE | Chỉ review sau khi mua, mỗi item 1 lần |
| rating | INTEGER | CHECK 1-5, NOT NULL | Số sao |
| comment | TEXT | NULLABLE | |
| created_at | TIMESTAMP | DEFAULT now() | |

### 2.11 Bảng `wishlists`

| Column | Type | Constraints | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK users.id, CASCADE | |
| product_id | UUID | FK products.id, CASCADE | |
| created_at | TIMESTAMP | DEFAULT now() | |

> UNIQUE constraint trên `(user_id, product_id)`

### 2.12 Bảng `notifications`

| Column | Type | Constraints | Mô tả |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK users.id, CASCADE | |
| title | VARCHAR(255) | NOT NULL | |
| body | TEXT | NOT NULL | |
| type | ENUM | NOT NULL | `order_update` \| `promotion` \| `system` |
| is_read | BOOLEAN | DEFAULT false | |
| data | JSONB | NULLABLE | Dữ liệu kèm (order_id...) |
| created_at | TIMESTAMP | DEFAULT now() | |

---

## 3. NESTJS BACKEND — API ENDPOINTS

```
Base URL: http://localhost:3000/api/v1
Auth header: Authorization: Bearer <access_token>
```

### Response format chuẩn

```json
// Success
{ "success": true, "data": {}, "message": "OK" }

// Paginated
{ "success": true, "data": [], "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 } }

// Error
{ "success": false, "message": "Sản phẩm không tồn tại", "statusCode": 404 }
```

### HTTP Status codes

| Code | Trường hợp |
|---|---|
| 200 | Thành công (GET, PATCH) |
| 201 | Tạo mới thành công (POST) |
| 400 | Dữ liệu đầu vào không hợp lệ |
| 401 | Chưa đăng nhập / token hết hạn |
| 403 | Không có quyền (user gọi admin API) |
| 404 | Tài nguyên không tìm thấy |
| 409 | Conflict (email đã tồn tại, đã review...) |
| 500 | Lỗi hệ thống |

---

### 3.1 Auth Module `/auth`

| Method | Endpoint | Auth | Mô tả | Body |
|---|---|---|---|---|
| POST | /auth/register | Public | Đăng ký | `{ email, password, full_name }` |
| POST | /auth/login | Public | Đăng nhập | `{ email, password }` |
| POST | /auth/refresh | Public | Làm mới token | `{ refresh_token }` |
| POST | /auth/logout | JWT | Đăng xuất | Xóa refresh_token trong DB |
| GET | /auth/me | JWT | Thông tin user hiện tại | |
| PATCH | /auth/me | JWT | Cập nhật profile | `{ full_name, phone, avatar_url }` |
| PATCH | /auth/change-password | JWT | Đổi mật khẩu | `{ old_password, new_password }` |

**Response login/register:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": { "id": "uuid", "email": "...", "full_name": "...", "role": "customer" }
}
```

### 3.2 Categories Module `/categories`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | /categories | Public | Tất cả danh mục đang hoạt động |
| GET | /categories/:slug | Public | Chi tiết danh mục theo slug |
| POST | /categories | Admin | Tạo danh mục mới |
| PATCH | /categories/:id | Admin | Cập nhật danh mục |
| DELETE | /categories/:id | Admin | Xóa danh mục |

### 3.3 Products Module `/products`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | /products | Public | Danh sách sản phẩm (pagination, filter, sort) |
| GET | /products/featured | Public | Sản phẩm nổi bật (is_featured=true) |
| GET | /products/:slug | Public | Chi tiết sản phẩm + images + specs |
| GET | /products/:id/reviews | Public | Đánh giá sản phẩm (paginated) |
| POST | /products | Admin | Tạo sản phẩm mới |
| PATCH | /products/:id | Admin | Cập nhật sản phẩm |
| DELETE | /products/:id | Admin | Xóa sản phẩm |

**Query params cho `GET /products`:**

| Param | Type | Mô tả |
|---|---|---|
| page | number | Số trang, default 1 |
| limit | number | Số item/trang, default 20 |
| category_id | UUID | Lọc theo danh mục |
| search | string | Tìm theo name, brand |
| min_price | number | Giá thấp nhất |
| max_price | number | Giá cao nhất |
| sort | string | `price_asc` \| `price_desc` \| `newest` \| `rating` |

### 3.4 Cart Module `/cart`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | /cart | JWT | Giỏ hàng hiện tại của user |
| POST | /cart/items | JWT | Thêm vào giỏ: `{ product_id, quantity }` |
| PATCH | /cart/items/:product_id | JWT | Cập nhật số lượng: `{ quantity }` |
| DELETE | /cart/items/:product_id | JWT | Xóa sản phẩm khỏi giỏ |
| DELETE | /cart | JWT | Xóa toàn bộ giỏ hàng |

### 3.5 Orders Module `/orders`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | /orders | JWT | Tạo đơn hàng mới từ giỏ hàng |
| GET | /orders | JWT | Danh sách đơn hàng của user (paginated) |
| GET | /orders/:id | JWT | Chi tiết đơn hàng |
| PATCH | /orders/:id/cancel | JWT | Hủy đơn (chỉ khi status=pending) |
| GET | /admin/orders | Admin | Tất cả đơn hàng (filter status) |
| PATCH | /admin/orders/:id/status | Admin | Cập nhật trạng thái đơn hàng |

**Body POST /orders:**
```json
{
  "address_id": "uuid",
  "payment_method": "cod",
  "note": "Ghi chú tùy chọn"
}
```

### 3.6 Reviews Module `/reviews`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | /reviews | JWT | Tạo review: `{ order_item_id, rating, comment }` |
| PATCH | /reviews/:id | JWT | Cập nhật review của mình |
| DELETE | /reviews/:id | JWT | Xóa review của mình |

### 3.7 Wishlist Module `/wishlist`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | /wishlist | JWT | Danh sách sản phẩm yêu thích |
| POST | /wishlist/:product_id | JWT | Thêm vào yêu thích |
| DELETE | /wishlist/:product_id | JWT | Bỏ khỏi yêu thích |

### 3.8 Addresses Module `/addresses`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | /addresses | JWT | Tất cả địa chỉ của user |
| POST | /addresses | JWT | Thêm địa chỉ mới |
| PATCH | /addresses/:id | JWT | Cập nhật địa chỉ |
| DELETE | /addresses/:id | JWT | Xóa địa chỉ |
| PATCH | /addresses/:id/default | JWT | Đặt làm mặc định |

### 3.9 Notifications Module `/notifications`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | /notifications | JWT | Danh sách thông báo (paginated) |
| PATCH | /notifications/:id/read | JWT | Đánh dấu đã đọc |
| PATCH | /notifications/read-all | JWT | Đánh dấu tất cả đã đọc |
| GET | /notifications/unread-count | JWT | Số thông báo chưa đọc |

### 3.10 Admin Stats `/admin/stats`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /admin/stats/overview | Tổng quan dashboard |
| GET | /admin/stats/revenue?period=30d | Doanh thu theo ngày |
| GET | /admin/stats/top-products | Top sản phẩm bán chạy |
| GET | /admin/users | Danh sách user (paginated) |
| PATCH | /admin/users/:id/status | Kích hoạt/vô hiệu hóa user |

---

## 4. FLUTTER MOBILE APP

### 4.1 Danh sách màn hình

| Màn hình | Route | Mô tả |
|---|---|---|
| Splash Screen | / | Logo + check auth |
| Onboarding | /onboarding | Giới thiệu app (lần đầu) |
| Login | /login | Đăng nhập email/password |
| Register | /register | Đăng ký tài khoản |
| Home | /home | Banner, featured, category |
| Product List | /products | Danh sách SP có filter |
| Product Detail | /product/:slug | Chi tiết SP, ảnh, specs |
| Search | /search | Tìm kiếm sản phẩm |
| Cart | /cart | Giỏ hàng |
| Checkout | /checkout | Đặt hàng, địa chỉ, thanh toán |
| Order List | /orders | Lịch sử đơn hàng |
| Order Detail | /order/:id | Chi tiết đơn hàng |
| Profile | /profile | Thông tin cá nhân |
| Address | /address | Quản lý địa chỉ |
| Wishlist | /wishlist | Sản phẩm yêu thích |
| Notifications | /notifications | Thông báo |

### 4.2 Cấu trúc thư mục

```
lib/
├── main.dart
├── app.dart                      # MaterialApp + GoRouter config
├── core/
│   ├── constants/
│   │   ├── api_constants.dart    # BASE_URL, endpoints
│   │   ├── app_colors.dart       # Color scheme
│   │   └── app_text_styles.dart  # TextStyle constants
│   ├── network/
│   │   ├── dio_client.dart       # Dio singleton + interceptors
│   │   ├── auth_interceptor.dart # Auto attach + refresh token
│   │   └── error_interceptor.dart
│   ├── storage/
│   │   └── secure_storage.dart   # Lưu/đọc tokens
│   ├── utils/
│   │   ├── formatters.dart       # Format VND, ngày giờ
│   │   └── validators.dart       # Validate email, phone...
│   └── widgets/                  # Reusable widgets
│       ├── product_card.dart
│       ├── loading_shimmer.dart
│       └── empty_state.dart
├── features/
│   ├── auth/
│   │   ├── screens/
│   │   ├── providers/
│   │   └── repositories/
│   ├── home/
│   ├── product/
│   ├── cart/
│   ├── order/
│   ├── wishlist/
│   ├── notification/
│   └── address/
└── providers/                    # Global Riverpod providers
```

### 4.3 Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter_riverpod: ^2.5.0       # State management
  dio: ^5.4.0                    # HTTP client
  flutter_secure_storage: ^9.0.0 # Lưu token an toàn
  hive_flutter: ^1.1.0           # Local cache
  go_router: ^13.0.0             # Navigation & routing
  cached_network_image: ^3.3.0   # Ảnh network có cache
  flutter_carousel_widget: ^2.3.0 # Banner slider
  shimmer: ^3.0.0                # Loading skeleton
  intl: ^0.19.0                  # Format VND, ngày giờ
  image_picker: ^1.0.0           # Chọn ảnh đại diện
  flutter_rating_bar: ^4.0.0     # Hiển thị đánh giá
  lottie: ^3.1.0                 # Animation empty state, success
  pretty_dio_logger: ^1.3.0      # Log API khi debug
```

### 4.4 Riverpod Providers

| Provider | Type | Mô tả |
|---|---|---|
| authProvider | StateNotifierProvider | User state, login/logout logic |
| cartProvider | StateNotifierProvider | Giỏ hàng, thêm/xóa/cập nhật |
| productsProvider | FutureProvider.family | Danh sách SP theo filter params |
| productDetailProvider | FutureProvider.family | Chi tiết SP theo slug |
| ordersProvider | StateNotifierProvider | Lịch sử đơn hàng |
| wishlistProvider | StateNotifierProvider | Danh sách yêu thích |
| notificationProvider | StateNotifierProvider | Thông báo + unread count |
| addressProvider | StateNotifierProvider | Danh sách địa chỉ |
| searchProvider | StateNotifierProvider | Kết quả tìm kiếm + query |

### 4.5 Network Layer — Dio & AuthInterceptor

```dart
// AuthInterceptor logic
// 1. Đọc access_token từ SecureStorage
// 2. Gán vào header: Authorization: Bearer <token>
// 3. Nếu response 401:
//    a. Lấy refresh_token từ SecureStorage
//    b. POST /auth/refresh { refresh_token }
//    c. Lưu access_token mới vào SecureStorage
//    d. Retry request gốc
//    e. Nếu refresh thất bại → navigate về /login, xóa tokens
```

Config Dio:
- `connectTimeout`: 30 giây
- `receiveTimeout`: 30 giây
- Interceptors: `AuthInterceptor`, `ErrorInterceptor`, `PrettyDioLogger` (debug only)

### 4.6 Chi tiết từng màn hình

#### Splash Screen
- Hiển thị logo Dosuone 1.5 giây
- Kiểm tra token trong SecureStorage
- Có token và còn hạn → navigate `/home`
- Không có / hết hạn → navigate `/onboarding` (lần đầu) hoặc `/login`

#### Home Screen
- AppBar: logo trái, icon thông báo (badge unread count) + icon giỏ hàng (badge số item) bên phải
- SearchBar ở trên (tap → navigate `/search`)
- Banner slider: auto-play 3 giây, PageView full width
- Category row: horizontal scroll, icon + tên danh mục
- Section "Sản phẩm nổi bật": `GET /products/featured`, grid 2 cột
- Section "Mới nhất": `GET /products?sort=newest&limit=10`
- Pull-to-refresh toàn trang

#### Product List Screen
- Nhận `category_id` hoặc `search` query từ route params
- AppBar hiển thị tên danh mục hoặc "Kết quả tìm kiếm"
- Filter bottom sheet: khoảng giá, danh mục, sắp xếp
- Grid 2 cột: `ProductCard` (ảnh, tên, giá, avg_rating)
- Infinite scroll: load thêm khi scroll gần cuối
- Skeleton loading khi fetch lần đầu

#### Product Detail Screen
- Image gallery: PageView full width + thumbnail row bên dưới
- Tên, giá (gạch ngang giá gốc nếu có `sale_price`)
- Hiển thị sao trung bình + số lượng review
- Nút "Thêm vào giỏ hàng" và "Mua ngay" (fixed ở bottom)
- Tab: **Mô tả** | **Thông số** | **Đánh giá**
  - Tab Thông số: hiển thị `product_specs` dạng bảng
  - Tab Đánh giá: phân trang, ảnh đại diện + tên + sao + bình luận
- Icon tim ở AppBar để thêm/bỏ wishlist

#### Cart Screen
- Danh sách CartItem: ảnh, tên, giá, stepper tăng/giảm số lượng, nút xóa
- Checkbox chọn tất cả
- Tính tổng tiền theo item được chọn
- Nút "Thanh toán" (disabled nếu giỏ trống)
- Empty state (Lottie animation) nếu giỏ trống

#### Checkout Screen
- **Bước 1 — Địa chỉ:** chọn từ danh sách hoặc thêm mới, hiện địa chỉ mặc định
- **Bước 2 — Thanh toán:** COD / Chuyển khoản / MoMo (radio button)
- **Bước 3 — Xem lại:** danh sách sản phẩm, phí ship, tổng tiền
- Ô nhập ghi chú tùy chọn
- Nút "Đặt hàng" → `POST /orders` → dialog thành công → navigate `/orders`

#### Order List Screen
- Tab filter: Tất cả | Chờ xác nhận | Đang giao | Đã giao | Đã hủy
- `OrderCard`: mã đơn, ngày đặt, tổng tiền, trạng thái (badge màu)

#### Order Detail Screen
- Thông tin địa chỉ giao hàng
- Danh sách sản phẩm + giá tiền
- Timeline trạng thái: pending → confirmed → shipping → delivered
- Nút "Hủy đơn" chỉ hiện khi `status=pending`
- Nút "Đánh giá" cho từng sản phẩm khi `status=delivered`

#### Profile Screen
- Ảnh đại diện (nút chỉnh sửa bằng `image_picker`), tên, email
- Menu: Đơn hàng của tôi | Địa chỉ | Yêu thích | Thông báo
- Menu: Đổi mật khẩu | Chính sách | Hỗ trợ
- Nút đăng xuất → `POST /auth/logout` + xóa tokens local

---

## 5. REACTJS ADMIN PANEL

### 5.1 Các trang Admin

| Trang | Route | Mô tả |
|---|---|---|
| Dashboard | /admin | Thống kê: doanh thu, đơn hàng, sản phẩm |
| Products | /admin/products | CRUD sản phẩm + ảnh + specs |
| Categories | /admin/categories | CRUD danh mục |
| Orders | /admin/orders | Xem & cập nhật trạng thái đơn hàng |
| Users | /admin/users | Xem users, kích hoạt/vô hiệu hóa |
| Reviews | /admin/reviews | Xem và xóa review |

### 5.2 Dashboard — Thống kê

- Card: Tổng doanh thu tháng này
- Card: Số đơn hàng hôm nay
- Card: Số sản phẩm đang bán
- Card: Số người dùng mới tuần này
- Biểu đồ doanh thu 30 ngày gần nhất (line chart)
- Bảng top 5 sản phẩm bán chạy

---

## 6. BUSINESS LOGIC

### 6.1 Tính tổng giỏ hàng

```
subtotal    = Σ(item.price × item.quantity) cho các item được chọn
shipping_fee = subtotal >= 500,000 VND ? 0 : 30,000 VND
total        = subtotal + shipping_fee - discount
```

### 6.2 Mã đơn hàng

```
Format: DH + YYYYMMDD + 4 số ngẫu nhiên
Ví dụ:  DH202501154823

// NestJS
const code = 'DH' + dayjs().format('YYYYMMDD') + Math.random().toString().slice(2, 6);
```

### 6.3 Flow đặt hàng (phải dùng DB Transaction)

1. Xác thực token, lấy `user_id`
2. Lấy `cart_items` của user từ DB
3. Kiểm tra stock từng sản phẩm
4. Lấy địa chỉ theo `address_id` (phải thuộc user)
5. Tính `subtotal`, `shipping_fee`, `total`
6. **Trong transaction:**
   - Tạo bản ghi `orders`
   - Tạo các bản ghi `order_items` (snapshot tên, ảnh, giá)
   - Trừ `stock` các sản phẩm
   - Xóa `cart_items` đã đặt hàng
7. Tạo notification cho user: *"Đơn hàng DH... đã được tạo thành công"*
8. Trả về order object

### 6.4 Quyền review

- User chỉ review được sản phẩm đã mua (`order_item` phải tồn tại)
- Đơn hàng phải có `status = delivered`
- Mỗi `order_item` chỉ review được 1 lần (UNIQUE constraint trên `order_item_id`)

### 6.5 Cập nhật avg_rating (sau mỗi tạo/xóa review)

```sql
UPDATE products SET
  avg_rating   = (SELECT AVG(rating) FROM reviews WHERE product_id = $1),
  review_count = (SELECT COUNT(*)    FROM reviews WHERE product_id = $1)
WHERE id = $1;
```

### 6.6 Format tiền VND (Flutter)

```dart
import 'package:intl/intl.dart';

final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
formatter.format(15990000); // → 15.990.000 đ
```

---

## 7. XỬ LÝ LỖI (Flutter)

- Bọc tất cả API call trong `try/catch`
- Lỗi 401: `AuthInterceptor` tự động xử lý refresh token
- Lỗi 400/404/409: hiện `SnackBar` màu đỏ với message từ server
- Lỗi network: dialog "Kiểm tra kết nối mạng"
- Lỗi 500: `SnackBar` "Có lỗi xảy ra, vui lòng thử lại"
- Không trả về `password` trong bất kỳ response nào (dùng `@Exclude` của `class-transformer`)

---

## 8. GHI CHÚ QUAN TRỌNG CHO AI AGENT

### Bắt buộc

- **KHÔNG** dùng varchar làm ID — **LUÔN** dùng UUID với `DEFAULT gen_random_uuid()`
- **LUÔN** dùng DB transaction khi tạo đơn hàng (orders + order_items + trừ stock)
- **LUÔN** hash password bằng bcrypt (`saltRounds=10`) trước khi lưu DB
- **KHÔNG** trả về `password` trong bất kỳ response nào
- `shipping_address` trong orders là JSONB snapshot — **KHÔNG** FK đến bảng addresses
- `product_name`, `product_image`, `price` trong `order_items` là snapshot — **KHÔNG** join lại
- Flutter: dùng `GoRouter` cho navigation — **KHÔNG** dùng `Navigator` trực tiếp
- Flutter: dùng `flutter_riverpod` — **KHÔNG** dùng `setState` cho business logic

### Thứ tự implement đề xuất

1. NestJS: setup project + TypeORM + kết nối DB + tạo entities
2. NestJS: Auth module (register, login, refresh, JWT guard, admin guard)
3. NestJS: Categories + Products CRUD
4. NestJS: Cart, Orders (với transaction), Reviews, Wishlist, Addresses, Notifications
5. NestJS: Admin stats endpoints
6. Flutter: setup project + Dio + SecureStorage + GoRouter + Riverpod
7. Flutter: Auth screens (Splash, Onboarding, Login, Register)
8. Flutter: Home, Product List, Product Detail, Search
9. Flutter: Cart, Checkout, Orders
10. Flutter: Profile, Wishlist, Notifications, Addresses
11. ReactJS: Admin panel

### Color scheme Flutter

```dart
// app_colors.dart
static const primary       = Color(0xFF2563EB);
static const primaryDark   = Color(0xFF1D4ED8);
static const accent        = Color(0xFFF59E0B); // badge, sale tag, rating stars
static const success       = Color(0xFF10B981); // đơn thành công, còn hàng
static const error         = Color(0xFFEF4444); // lỗi, hết hàng, giá gạch ngang
static const background    = Color(0xFFF8FAFC);
static const surface       = Color(0xFFFFFFFF); // card, bottom sheet
static const textPrimary   = Color(0xFF0F172A);
static const textSecondary = Color(0xFF64748B); // placeholder, mô tả phụ
```
