#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/dosuone"
cd "$ROOT"

git checkout -- deploy/setup-vps.sh 2>/dev/null || true
git pull --ff-only

if [ -f "$ROOT/backend/.env" ]; then
  if grep -q '^CORS_ORIGINS=' "$ROOT/backend/.env"; then
    sed -i 's|^CORS_ORIGINS=.*|CORS_ORIGINS=https://one.dosutech.site|' "$ROOT/backend/.env"
  else
    echo 'CORS_ORIGINS=https://one.dosutech.site' >> "$ROOT/backend/.env"
  fi
fi

cd "$ROOT/admin"
npm ci
npm run build

cd "$ROOT"
pm2 reload dosuone-one-api

sudo cp "$ROOT/deploy/nginx/one.dosutech.site.conf" /etc/nginx/sites-available/
sudo cp "$ROOT/deploy/nginx/api-one.dosutech.site.conf" /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/one.dosutech.site.conf /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/api-one.dosutech.site.conf /etc/nginx/sites-enabled/
if ! sudo nginx -t; then
  echo "Nginx loi. Thu bo http2 trong deploy/nginx/*.conf neu nginx cu."
  exit 1
fi
sudo systemctl reload nginx

echo "Done. Admin: https://one.dosutech.site"
echo "API qua admin: https://one.dosutech.site/api/v1"
echo "API rieng: http://api-one.dosutech.site/api/v1 (HTTPS sau khi certbot thanh cong)"
echo "Thu cert api-one: sudo certbot certonly --nginx -d api-one.dosutech.site"
