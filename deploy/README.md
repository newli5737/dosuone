# Deploy DOSUONE — /home/dosuone

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

## Cert api-one (khi cần HTTPS subdomain riêng)

```bash
sudo certbot certonly --nginx -d api-one.dosutech.site
bash deploy/enable-https.sh
```

## Tài khoản

admin@dosuone.com / admin123
