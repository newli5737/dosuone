# Deploy DOSUONE (`/home/dosuone`)

## Port & PM2

| Thành phần | Giá trị |
|------------|---------|
| PM2 | `dosuone-one-api` |
| Port | **3018** |
| API | `https://api-one.dosutech.site/api/v1` |
| Admin | `https://one.dosutech.site` |

## Lần đầu (HTTP)

```bash
cd /home/dosuone
git pull
bash deploy/setup-vps.sh
# Copy nginx HTTP-only từ commit cũ hoặc certbot trước — xem bước HTTPS bên dưới
```

## Bật HTTPS + redirect (sau khi DNS OK)

**Cách 1 — Certbot tự chỉnh nginx (đơn giản):**

```bash
sudo certbot --nginx -d api-one.dosutech.site --redirect
sudo certbot --nginx -d one.dosutech.site --redirect
bash /home/dosuone/deploy/enable-https.sh
```

Script `enable-https.sh` sẽ: copy config HTTPS từ repo, sửa `backend/.env` CORS, build lại admin, `pm2 reload`.

**Cách 2 — Cert trước, copy config repo:**

```bash
sudo certbot certonly --nginx -d api-one.dosutech.site
sudo certbot certonly --nginx -d one.dosutech.site
bash /home/dosuone/deploy/enable-https.sh
```

Hoặc một lệnh cert cả hai (cùng cert nếu certbot cho phép):

```bash
CERTBOT_EMAIL=admin@dosutech.site bash deploy/enable-https.sh
```

## Cập nhật `.env` trên VPS (sau HTTPS)

`backend/.env`:

```env
PORT=3018
CORS_ORIGINS=https://one.dosutech.site
```

Rebuild admin:

```bash
cd /home/dosuone/admin
npm run build
pm2 reload dosuone-one-api
```

## Mobile

`api_constants.dart` trỏ `https://api-one.dosutech.site/api/v1` — build lại APK/IPA sau khi API HTTPS sống.

## Tài khoản test

- Admin: `admin@dosuone.com` / `admin123`
- Khách: `customer@dosuone.com` / `customer123`
