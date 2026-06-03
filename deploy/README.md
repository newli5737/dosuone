# Deploy DOSUONE — /home/dosuone

## GitHub Actions CI/CD

Workflow: `.github/workflows/deploy.yml`

**Secrets** (Settings → Secrets and variables → Actions):

| Secret | Mô tả |
|--------|--------|
| `VPS_HOST` | IP hoặc hostname VPS |
| `VPS_USER` | SSH user (vd. `root`) |
| `VPS_SSH_PRIVATE` | Private key PEM (toàn bộ nội dung `id_rsa`) |

VPS cần clone repo tại `/home/dosuone`, cài Node 20+, PM2, nginx. Lần đầu trên VPS:

```bash
cd /home/dosuone
chmod +x deploy/deploy-remote.sh
pm2 start deploy/ecosystem.config.cjs
pm2 save
```

Push lên nhánh `main` hoặc `master` → CI build → SSH chạy `deploy/deploy-remote.sh`.

Chạy tay trên VPS:

```bash
bash /home/dosuone/deploy/deploy-remote.sh
```

Admin HTTPS: https://one.dosutech.site  
API cho admin (cùng domain): https://one.dosutech.site/api/v1  
API riêng (mobile, sau cert): https://api-one.dosutech.site/api/v1  

PM2: dosuone-one-api — port 3018

## Pull bị conflict setup-vps.sh

```bash
cd /home/dosuone
git checkout -- deploy/setup-vps.sh
git pull
bash deploy/fix-vps.sh
```

Hoặc một lệnh:

```bash
bash deploy/pull.sh && bash deploy/fix-vps.sh
```

## Cert + redirect api-one.dosutech.site

```bash
cd /home/dosuone
git pull
chmod +x deploy/certbot-api-one.sh
bash deploy/certbot-api-one.sh admin@dosutech.site
```

Hoặc từng bước:

```bash
sudo cp /home/dosuone/deploy/nginx/api-one.dosutech.site.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/api-one.dosutech.site.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot certonly --nginx -d api-one.dosutech.site
sudo cp /home/dosuone/deploy/nginx/api-one.dosutech.site.ssl.conf /etc/nginx/sites-available/api-one.dosutech.site.conf
sudo sed -i '/http2/d' /etc/nginx/sites-available/api-one.dosutech.site.conf
sudo nginx -t && sudo systemctl reload nginx
```

## Tài khoản

admin@dosuone.com / admin123
