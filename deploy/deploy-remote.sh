#!/usr/bin/env bash
# Pull + build backend + admin trên VPS (/home/dosuone)
set -e
cd /home/dosuone
git fetch origin
git reset --hard origin/main
cd backend && npm ci && npm run build
pm2 reload dosuone-one-api --update-env
cd ../admin && npm ci && npm run build
echo "Done."
