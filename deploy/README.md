# Deploy DOSUONE — /home/dosuone

Admin HTTPS: https://one.dosutech.site  
API cho admin (cùng domain): https://one.dosutech.site/api/v1  
API riêng (mobile, sau cert): https://api-one.dosutech.site/api/v1  

PM2: dosuone-one-api — port 3018

## Sửa nhanh sau khi pull (admin xấu / API lỗi SSL)

```bash
cd /home/dosuone
git pull
chmod +x deploy/fix-vps.sh
bash deploy/fix-vps.sh
```

## Cert api-one (khi cần HTTPS subdomain riêng)

```bash
sudo certbot certonly --nginx -d api-one.dosutech.site
bash deploy/enable-https.sh
```

## Tài khoản

admin@dosuone.com / admin123
