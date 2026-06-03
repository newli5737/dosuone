#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/dosuone"
EMAIL="${1:-}"

cd "$ROOT"

sudo cp "$ROOT/deploy/nginx/api-one.dosutech.site.conf" /etc/nginx/sites-available/api-one.dosutech.site.conf
sudo ln -sf /etc/nginx/sites-available/api-one.dosutech.site.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

if [ -n "$EMAIL" ]; then
  sudo certbot certonly --nginx -d api-one.dosutech.site --non-interactive --agree-tos -m "$EMAIL"
else
  sudo certbot certonly --nginx -d api-one.dosutech.site
fi

sudo cp "$ROOT/deploy/nginx/api-one.dosutech.site.ssl.conf" /etc/nginx/sites-available/api-one.dosutech.site.conf
sudo sed -i '/http2/d' /etc/nginx/sites-available/api-one.dosutech.site.conf
sudo sed -i '/http2/d' /etc/nginx/sites-enabled/api-one.dosutech.site.conf 2>/dev/null || true
sudo nginx -t
sudo systemctl reload nginx

echo "HTTPS: https://api-one.dosutech.site/api/v1"
