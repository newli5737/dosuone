#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/dosuone"
EMAIL="${CERTBOT_EMAIL:-}"

if [ -n "$EMAIL" ]; then
  sudo certbot certonly --nginx -d api-one.dosutech.site --non-interactive --agree-tos -m "$EMAIL" || true
fi

if [ ! -f /etc/letsencrypt/live/api-one.dosutech.site/fullchain.pem ]; then
  echo "Chua co SSL cho api-one.dosutech.site"
  echo "Chay: sudo certbot certonly --nginx -d api-one.dosutech.site"
  echo "Admin van dung API: https://one.dosutech.site/api/v1"
  exit 0
fi

sudo tee /etc/nginx/sites-available/api-one.dosutech.site.conf > /dev/null <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name api-one.dosutech.site;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api-one.dosutech.site;

    ssl_certificate     /etc/letsencrypt/live/api-one.dosutech.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api-one.dosutech.site/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:3018;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

sudo nginx -t
sudo systemctl reload nginx
echo "API HTTPS: https://api-one.dosutech.site/api/v1"
