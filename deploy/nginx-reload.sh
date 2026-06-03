#!/usr/bin/env bash
set -euo pipefail
cd /home/dosuone
git checkout -- deploy/ 2>/dev/null || true
git pull --ff-only
sudo cp /home/dosuone/deploy/nginx/one.dosutech.site.conf /etc/nginx/sites-available/one.dosutech.site.conf
sudo cp /home/dosuone/deploy/nginx/api-one.dosutech.site.conf /etc/nginx/sites-available/api-one.dosutech.site.conf
sudo ln -sf /etc/nginx/sites-available/one.dosutech.site.conf /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/api-one.dosutech.site.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
echo OK
