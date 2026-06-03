#!/usr/bin/env bash
# Chạy trên VPS (root): bash /home/dosuone/deploy/setup-vps.sh
set -euo pipefail

ROOT="/home/dosuone"
API_URL="${VITE_API_URL:-https://api-one.dosutech.site/api/v1}"

echo "==> DOSUONE setup @ $ROOT"

mkdir -p "$ROOT/logs"

# Backend .env
if [ ! -f "$ROOT/backend/.env" ]; then
  cp "$ROOT/deploy/env.backend.example" "$ROOT/backend/.env"
  echo "    Đã tạo backend/.env từ deploy/env.backend.example"
else
  echo "    Giữ nguyên backend/.env"
fi

echo "==> Backend: install + build"
cd "$ROOT/backend"
npm ci
npm run build
npm run db:create || true
npm run seed

echo "==> Admin: build (API=$API_URL)"
cd "$ROOT/admin"
npm ci
VITE_API_URL="$API_URL" npm run build

echo "==> PM2"
cd "$ROOT"
pm2 startOrReload deploy/ecosystem.config.cjs
pm2 save

echo "==> Nginx (cần chạy thủ công nếu chưa copy config)"
echo "    sudo cp $ROOT/deploy/nginx/*.conf /etc/nginx/sites-available/"
echo "    sudo ln -sf /etc/nginx/sites-available/api-one.dosutech.site.conf /etc/nginx/sites-enabled/"
echo "    sudo ln -sf /etc/nginx/sites-available/one.dosutech.site.conf /etc/nginx/sites-enabled/"
echo "    sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "Xong. API local: http://127.0.0.1:3018/api/v1"
echo "     Sau certbot: bash deploy/enable-https.sh"
echo "     Public:      https://api-one.dosutech.site/api/v1"
echo "     Admin:       https://one.dosutech.site"
