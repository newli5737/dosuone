# Deploy DOSUONE lên VPS (`/home/dosuTech/appbandt`)

## Port & PM2

| Thành phần | Giá trị |
|------------|---------|
| PM2 name | `dosuone-one-api` |
| Port API | **3018** (không dùng 3000) |
| API public | `http://api-one.dosutech.site/api/v1` |
| Admin | `http://one.dosutech.site` |

## Lần đầu trên VPS

```bash
cd /home/dosuTech/appbandt
chmod +x deploy/setup-vps.sh
bash deploy/setup-vps.sh
```

Script sẽ: tạo `.env` (nếu chưa có), `npm ci` + build backend, `db:create`, **seed**, build admin, `pm2 startOrReload`.

## Nginx

```bash
sudo cp /home/dosuTech/appbandt/deploy/nginx/*.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/api-one.dosutech.site.conf /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/one.dosutech.site.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Certbot (sau)

```bash
sudo certbot --nginx -d api-one.dosutech.site
sudo certbot --nginx -d one.dosutech.site
```

Sau HTTPS, build lại admin:

```bash
cd /home/dosuTech/appbandt/admin
VITE_API_URL=https://api-one.dosutech.site/api/v1 npm run build
```

Cập nhật `CORS_ORIGINS` trong `backend/.env` nếu cần.

## Cập nhật code

```bash
cd /home/dosuTech/appbandt
git pull
bash deploy/setup-vps.sh
```
