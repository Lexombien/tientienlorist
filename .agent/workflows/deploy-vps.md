---
description: Deploy lên VPS với Node.js 22 LTS nhanh chóng
---

# Workflow: Deploy to VPS (Node.js 22 LTS)

Hướng dẫn triển khai nhanh nhất lên VPS với Node.js 22 LTS.

## Bước 1: Chuẩn bị VPS

// turbo
1. SSH vào VPS và cài đặt môi trường (chỉ làm 1 lần):

```bash
ssh root@YOUR_VPS_IP

# Cài tất cả dependencies
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
apt update && apt install -y nodejs nginx git && \
npm install -g pm2@latest
```

2. Kiểm tra version:

```bash
node -v    # Kỳ vọng: v22.x.x
npm -v     # Kỳ vọng: 10.x.x
```

## Bước 2: Upload Code

Chọn 1 trong 3 cách:

### Cách 1: Git (Khuyên dùng)

```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git floral-shop
cd floral-shop
```

### Cách 2: SCP từ Windows

Trên Windows PowerShell:
```powershell
scp -r e:\TIENTIÈNOLORITS\* root@YOUR_VPS_IP:/var/www/floral-shop/
```

Sau đó SSH vào VPS:
```bash
ssh root@YOUR_VPS_IP
cd /var/www/floral-shop
```

### Cách 3: FileZilla/WinSCP

- Host: YOUR_VPS_IP
- Port: 22
- Username: root
- Path: /var/www/floral-shop

## Bước 3: Deploy Tự Động

// turbo
```bash
cd /var/www/floral-shop
chmod +x deploy.sh
bash deploy.sh
```

Script sẽ tự động:
- Cài dependencies
- Build production
- Cấu hình PM2
- Cấu hình Nginx
- Mở firewall

## Bước 4: Kiểm Tra

// turbo
```bash
# Kiểm tra PM2
pm2 status

# Kiểm tra Nginx
systemctl status nginx

# Kiểm tra website
curl http://localhost
```

## Bước 5: Truy Cập

Mở browser và truy cập:
- Frontend: `http://YOUR_VPS_IP`
- Admin: `http://YOUR_VPS_IP/#admin`

## Troubleshooting

### Website không truy cập được

```bash
pm2 status
pm2 logs floral-backend --lines 50
systemctl status nginx
```

### Port bị chiếm

```bash
lsof -i :3001
kill -9 PID
pm2 restart floral-backend
```

### Build failed

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Update Code Sau Này

// turbo
```bash
cd /var/www/floral-shop
bash update.sh
```

Hoặc thủ công:
```bash
git pull
npm install
npm run build
pm2 restart floral-backend
```

---

✅ Deploy hoàn tất! Website đã live trên VPS!
