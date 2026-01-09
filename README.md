# 🌸 Tientien Florist - Hướng Dẫn Deploy VPS

Website bán hoa cao cấp với Admin Panel và Analytics.

---

## 🚀 1. DEPLOY LẦN ĐẦU

### Bước 1: Clone code lên VPS

```bash
# SSH vào VPS
ssh root@YOUR_VPS_IP

# Clone repository
mkdir -p /var/www
cd /var/www
git clone https://github.com/Lexombien/tientienlorist.git
cd tientienlorist
```

### Bước 2: Chạy script deploy

```bash
chmod +x auto-deploy.sh
sudo bash auto-deploy.sh
```
✅✅✅✅✅✅✅FIX SSL :✅✅✅✅✅✅✅✅✅ 
certbot --nginx -d lemyloi.work.gd 
Script sẽ tự động:
- ✅ Cài Node.js 22 LTS
- ✅ Cài Nginx, PM2, Certbot
- ✅ Build frontend
- ✅ Start backend
- ✅ Cấu hình Nginx
- ✅ Setup SSL (nếu domain đã trỏ về VPS)
- ✅ Cấu hình firewall

### Bước 3: Nhập thông tin

Script sẽ hỏi:
1. **Domain:** Tên miền của bạn (vd: `tientien.2bd.net`)
2. **WWW:** Có muốn thêm `www.domain` không? (y/n)
3. **Admin username:** Tên đăng nhập admin
4. **Admin password:** Mật khẩu admin (tối thiểu 8 ký tự)
5. **Email SSL:** Email nhận thông báo SSL (hoặc để trống)

### Bước 4: Truy cập website

```
🌐 Website: http(s)://YOUR_DOMAIN
🔐 Admin: http(s)://YOUR_DOMAIN/#admin
```

---

## 🔄 2. UPDATE CODE TỪ GITHUB

Khi có code mới trên GitHub:

```bash
cd /var/www/tientienlorist
sudo bash auto-update.sh
```

Script sẽ tự động:
- ✅ Pull code mới từ GitHub
- ✅ Install dependencies
- ✅ Build frontend
- ✅ Restart backend
- ✅ Reload Nginx

---

## 🔧 3. FIX LỖI

Nếu gặp lỗi (ảnh không hiển thị, API không kết nối, backend crash...):

```bash
cd /var/www/tientienlorist
sudo bash quick-fix.sh
```

Script sẽ tự động:
- ✅ Cài các dependencies thiếu (axios, etc)
- ✅ Fix permissions cho uploads folder
- ✅ Xóa Nginx configs cũ (conflict)
- ✅ Restart PM2 và Nginx
- ✅ Test backend API

---

## 📋 LỖI THƯỜNG GẶP

### ❌ Lỗi: "Lỗi kết nối đến server!"

**Nguyên nhân:** Backend thiếu dependency hoặc không chạy

**Fix:**
```bash
cd /var/www/tientienlorist
npm install axios
pm2 restart all
pm2 logs --lines 20
```

---

### ❌ Lỗi: Ảnh upload không hiển thị

**Nguyên nhân:** Nginx config của `location ^~ /uploads/` đang trỏ sai thư mục `root`

**Triệu chứng:**
- Ảnh upload thành công (200 OK)
- Nhưng khi truy cập ảnh bị 404 Not Found
- Nginx error log: "open() failed (2: No such file or directory)"

**Fix nhanh nhất:**
```bash
# Fix Nginx config - sửa root trong location uploads
sudo sed -i '/location \^~ \/uploads\/ {/,/}/ s|root /var/www/tientienlorist/dist;|root /var/www/tientienlorist;|' /etc/nginx/sites-available/tientien.2bd.net

# Check lại

sudo cat /etc/nginx/sites-available/tientien.2bd.net | grep -A 3 "location.*uploads"

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

**Hoặc dùng quick-fix (khuyên dùng):**
```bash
cd /var/www/tientienlorist
sudo bash quick-fix.sh
```

**Fix manual từng bước:**
```bash
# Fix permissions
sudo mkdir -p /var/www/tientienlorist/uploads
sudo chmod 755 /var/www/tientienlorist/uploads
sudo chown -R www-data:www-data /var/www/tientienlorist/uploads

# Reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

**Giải thích:**
- Thư mục `uploads/` nằm ở `/var/www/tientienlorist/uploads`
- Frontend (dist/) nằm ở `/var/www/tientienlorist/dist`
- Nginx cần serve uploads từ parent directory, không phải dist/
- Location `^~ /uploads/` phải có `root /var/www/tientienlorist;` (không có /dist)


---

### ❌ Lỗi: Upload ảnh >1MB bị fail

**Nguyên nhân:** Nginx mặc định giới hạn upload = **1MB**

**Triệu chứng:**
- Upload ảnh <1MB: ✅ OK
- Upload ảnh >1MB: ❌ Error "SyntaxError: Unexpected token '<'"
- Console log: "Unexpected end of JSON input"

**⚠️ LƯU Ý QUAN TRỌNG:**
`client_max_body_size` phải nằm trong **server block HTTPS (port 443)**, KHÔNG phải server block HTTP redirect (port 80)!

**Fix đúng:**

```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-available/YOUR_DOMAIN

# Tìm server block với "listen 443 ssl;"
# THÊM dòng này NGAY SAU "server_name YOUR_DOMAIN;"
```

```nginx
server {
    server_name YOUR_DOMAIN;
    
    # ← THÊM DÒNG NÀY Ở ĐÂY (trong server block HTTPS)
    client_max_body_size 10M;
    
    root /var/www/tientienlorist/dist;
    # ... rest of config ...
    
    listen 443 ssl;  # ← Server block có dòng này
    # ... SSL config ...
}

# ❌ KHÔNG thêm vào server block này:
server {
    # ← KHÔNG thêm ở đây!
    listen 80;  # ← Server block HTTP redirect
    # ... redirect config ...
}
```

**Test và reload:**
```bash
# Test config
sudo nginx -t

# Reload nếu OK
sudo systemctl reload nginx
```

**Tăng giới hạn nếu cần:**
- **20MB:** `client_max_body_size 20M;`
- **50MB:** `client_max_body_size 50M;`

---

### ❌ Lỗi: Nginx conflicting server name

**Nguyên nhân:** Có config Nginx cũ conflict

**Fix:**
```bash
# Xóa configs cũ
sudo rm -f /etc/nginx/sites-enabled/floral-shop
sudo rm -f /etc/nginx/sites-enabled/default

# Test và reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🛠️ COMMANDS HỮU ÍCH

```bash
# Check PM2 status
pm2 status
pm2 logs tientienlorist --lines 50

# Restart backend
pm2 restart tientienlorist

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
sudo systemctl reload nginx

# Check backend API
curl http://localhost:3001/api/health

# Xem logs
pm2 logs tientienlorist
sudo tail -f /var/log/nginx/error.log
```

---

## 📁 CẤU TRÚC PROJECT

```
/var/www/tientienlorist/
├── auto-deploy.sh      # Script deploy tự động
├── auto-update.sh      # Script update code từ GitHub
├── quick-fix.sh        # Script fix lỗi nhanh
├── server.js           # Backend Node.js
├── dist/               # Frontend build (sau khi npm run build)
├── uploads/            # Folder chứa ảnh upload
├── database.json       # Database products/settings
├── analytics.json      # Analytics data
└── .env                # Environment variables (chứa admin credentials)
```

---

## ⚙️ CẤU HÌNH

### Environment Variables (`.env`)

```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password
DOMAIN=your-domain.com
```

### PM2 Process

```bash
# Tên process: tientienlorist
# Port: 3001
# Mode: production
```

### Nginx

```bash
# Config: /etc/nginx/sites-available/YOUR_DOMAIN
# Serve frontend: /var/www/tientienlorist/dist
# Serve uploads: /var/www/tientienlorist/uploads
# Proxy API: localhost:3001
```

### ⚡ Tối ưu Compression (Brotli + Gzip)
cd /var/www/tientienlorist
CHẠY: 
cd /var/www/tientienlorist
sudo bash install-brotli-complete.sh

**Vite đã pre-compress files khi build** (tạo `.br` và `.gz`)
s
**Enable Brotli trong Nginx:**

```bash
# Cài Brotli module (nếu chưa có)
sudo apt install nginx-module-brotli -y

# Edit nginx.conf
sudo nano /etc/nginx/nginx.conf
```

**Thêm vào `http {}` block:**

```nginx
http {
    # ... existing config ...
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;
    
    # Brotli compression (better than gzip)
    brotli on;
    brotli_comp_level 6;
    brotli_static on;  # Serve pre-compressed .br files
    brotli_types text/plain text/css text/xml text/javascript 
                 application/json application/javascript application/xml+rss 
                 application/rss+xml font/truetype font/opentype 
                 application/vnd.ms-fontobject image/svg+xml;
    
    # ... rest of config ...
}
```

**Test và reload:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Kết quả:**
- 📦 **HTML/CSS/JS giảm ~70%** (với Brotli)
- ⚡ **Load time nhanh hơn 3-5x**
- 💾 **Tiết kiệm bandwidth**

---

## 🔐 BẢO MẬT

- ✅ Admin credentials lưu trong `.env` (không expose ra frontend)
- ✅ File `.env` có permissions 600 (chỉ root đọc được)
- ✅ Firewall UFW: Chỉ mở port 22, 80, 443
- ✅ SSL/HTTPS tự động với Let's Encrypt

---

## 📞 HỖ TRỢ

**Nếu vẫn gặp lỗi:**

1. Chạy `sudo bash quick-fix.sh`
2. Check logs: `pm2 logs tientienlorist --lines 100`
3. Test backend: `curl http://localhost:3001/api/health`
4. Test Nginx: `sudo nginx -t`

**Nếu cần deploy lại từ đầu:**
```bash
cd /var/www/tientienlorist
sudo bash auto-deploy.sh
```

---

## ✅ CHECKLIST SAU KHI DEPLOY

- [ ] Website truy cập được: `http(s)://YOUR_DOMAIN`
- [ ] Admin panel hoạt động: `http(s)://YOUR_DOMAIN/#admin`
- [ ] Upload ảnh thành công
- [ ] Ảnh hiển thị đúng
- [ ] Backend API hoạt động: `curl http://localhost:3001/api/health`
- [ ] PM2 running: `pm2 status`
- [ ] Nginx running: `sudo systemctl status nginx`
- [ ] SSL/HTTPS hoạt động (nếu đã setup)

---

**🎉 Chúc bạn deploy thành công!**

*Powered by Node.js 22 LTS, React, Express, Nginx, PM2*
"# tientienlorist" 
