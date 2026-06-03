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
