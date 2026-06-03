#!/usr/bin/env bash
set -euo pipefail
cd /home/dosuone
git checkout -- deploy/ 2>/dev/null || true
git pull --ff-only
chmod +x deploy/*.sh 2>/dev/null || true
echo "Pull xong."
