# DOSUONE Phone Store

Hệ thống cửa hàng điện thoại gồm **NestJS API**, **Flutter Mobile**, **React Admin**.

## Cấu trúc

```
appbandt/
├── backend/     # NestJS REST API
├── mobile/      # Flutter app (Android/iOS)
└── admin/       # React admin panel
```

## Khởi chạy

### 1. PostgreSQL (cài sẵn trên máy local)

Tạo database (một lần), ví dụ qua `psql` hoặc pgAdmin:

```sql
CREATE DATABASE dosuone;
```

Sao chép và chỉnh file môi trường backend:

```bash
cd backend
copy .env.example .env
```

Trong `.env`, cập nhật `DB_PASSWORD` (và `DB_USER` / `DB_PORT` nếu khác mặc định):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<mật khẩu postgres của bạn>
DB_NAME=dosuone
```

### 2. Backend API

```bash
cd backend
npm install
npm run start:dev
npm run seed
```

TypeORM `synchronize: true` sẽ tự tạo bảng khi API chạy lần đầu.

API: `http://localhost:3000/api/v1`

**Tài khoản test:**
- Admin: `admin@dosuone.com` / `admin123`
- Khách (mobile): `customer@dosuone.com` / `customer123`

Chạy lại seed sau khi đổi dữ liệu mẫu: `npm run seed` (trong thư mục `backend`)

### 3. Flutter Mobile

```bash
cd mobile
flutter pub get
flutter run
```

Đổi `ApiConstants.baseUrl` trong `mobile/lib/core/constants/api_constants.dart`:
- Android emulator: `http://10.0.2.2:3000/api/v1`
- iOS simulator: `http://localhost:3000/api/v1`
- Thiết bị thật: IP máy tính LAN

### 4. Admin Panel

```bash
cd admin
npm install
npm run dev
```

Mở `http://localhost:5173` — đăng nhập bằng tài khoản admin.

## Tính năng đã triển khai

- JWT auth (access 15p, refresh 7 ngày)
- CRUD categories, products (filter, sort, pagination)
- Giỏ hàng, đặt hàng (transaction, snapshot địa chỉ/sản phẩm)
- Reviews, wishlist, addresses, notifications
- Admin stats, quản lý đơn & users
- Flutter: Splash, Onboarding, Login/Register, Home, Products, Cart, Checkout, Orders, Profile, v.v.
- React Admin: Dashboard, Products, Orders, Users
