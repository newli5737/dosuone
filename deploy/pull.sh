#!/usr/bin/env bash
set -euo pipefail
cd /home/dosuone
git checkout -- deploy/setup-vps.sh 2>/dev/null || true
git pull
chmod +x deploy/fix-vps.sh deploy/setup-vps.sh deploy/enable-https.sh 2>/dev/null || true
echo "Pull xong. Chay: bash deploy/fix-vps.sh"
