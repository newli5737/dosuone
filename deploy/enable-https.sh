#!/usr/bin/env bash
# Bật HTTPS sau khi DNS đã trỏ. Chạy: bash /home/dosuone/deploy/enable-https.sh
# Tuỳ chọn: CERTBOT_EMAIL=you@mail.com bash deploy/enable-https.sh
set -euo pipefail

ROOT="/home/dosuone"
EMAIL="${CERTBOT_EMAIL:-}"

echo "==> Certbot (cần certificate trước khi bật config HTTPS)"
if [ -z "$EMAIL" ]; then
  echo "    Chạy thủ công nếu chưa có cert:"
  echo "    sudo certbot certonly --nginx -d api-one.dosutech.site"
  echo "    sudo certbot certonly --nginx -d one.dosutech.site"
  echo ""
  read -r -p "Đã có cert cho cả 2 domain? (y/N) " ok
  if [ "${ok,,}" != "y" ]; then
    echo "Hủy. Xin cert rồi chạy lại script."
    exit 1
  fi
else
  sudo certbot certonly --nginx \
    -d api-one.dosutech.site \
    -d one.dosutech.site \
    --non-interactive --agree-tos -m "$EMAIL" \
    || true
fi

echo "==> Nginx HTTPS + redirect"
sudo cp "$ROOT/deploy/nginx/"*.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/api-one.dosutech.site.conf /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/one.dosutech.site.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "==> Backend .env — CORS HTTPS"
ENV_FILE="$ROOT/backend/.env"
if grep -q '^CORS_ORIGINS=' "$ENV_FILE" 2>/dev/null; then
  sed -i 's|^CORS_ORIGINS=.*|CORS_ORIGINS=https://one.dosutech.site|' "$ENV_FILE"
else
  echo 'CORS_ORIGINS=https://one.dosutech.site' >> "$ENV_FILE"
fi

echo "==> Admin rebuild (API HTTPS)"
cd "$ROOT/admin"
VITE_API_URL=https://api-one.dosutech.site/api/v1 npm run build

echo "==> PM2 reload API"
cd "$ROOT"
pm2 reload dosuone-one-api

echo ""
echo "Xong."
echo "  API:   https://api-one.dosutech.site/api/v1"
echo "  Admin: https://one.dosutech.site"
echo "  Login: admin@dosuone.com / admin123"
