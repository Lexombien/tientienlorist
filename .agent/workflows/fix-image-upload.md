---
description: Fix lỗi ảnh upload không hiển thị
---

# Workflow: Fix Ảnh Upload Không Hiển Thị

Khi upload ảnh thành công nhưng không hiển thị trên website.

## Nguyên nhân

Nginx config của `location ^~ /uploads/` đang trỏ sai thư mục `root`:
- **Sai:** `root /var/www/tientienlorist/dist;` (trỏ vào dist/)
- **Đúng:** `root /var/www/tientienlorist;` (trỏ vào parent dir)

## Triệu chứng

- ✅ Upload ảnh thành công (API trả 200 OK)
- ❌ Ảnh không hiển thị (404 Not Found)
- ❌ Nginx error log: "open() failed (2: No such file or directory)"

## Bước 1: Fix Nhanh (Cách 1 - Khuyên dùng)

// turbo
```bash
cd /var/www/tientienlorist
sudo bash quick-fix.sh
```

Script sẽ tự động:
- Fix Nginx uploads location root path
- Fix permissions cho uploads folder
- Restart PM2 và Nginx
- Test backend API

## Bước 2: Fix Manual (Cách 2)

Nếu quick-fix không có sẵn:

```bash
# Fix Nginx config - sửa root trong location uploads
sudo sed -i '/location \^~ \/uploads\/ {/,/}/ s|root /var/www/tientienlorist/dist;|root /var/www/tientienlorist;|' /etc/nginx/sites-available/YOUR_DOMAIN

# Check lại config
sudo cat /etc/nginx/sites-available/YOUR_DOMAIN | grep -A 3 "location.*uploads"

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

**Lưu ý:** Thay `YOUR_DOMAIN` bằng domain thực tế (vd: `tientien.2bd.net`)

## Bước 3: Verify

```bash
# Check uploads folder exists
ls -la /var/www/tientienlorist/uploads

# Check Nginx config
sudo nginx -T | grep -A 10 "location.*uploads"

# Test image access
curl -I http://YOUR_DOMAIN/uploads/test-image.jpg
```

## Giải thích

Cấu trúc thư mục:
```
/var/www/tientienlorist/
├── dist/              # Frontend static files
│   ├── index.html
│   └── assets/
└── uploads/           # Uploaded images (ngoài dist/)
    └── *.jpg
```

Nginx config đúng:
```nginx
# Main server block
root /var/www/tientienlorist/dist;  # Serve frontend từ dist/

# Uploads location
location ^~ /uploads/ {
    root /var/www/tientienlorist;    # Serve uploads từ parent dir
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

Khi request `/uploads/image.jpg`:
- Nginx tìm file tại: `root + location = /var/www/tientienlorist + /uploads/image.jpg`
- Nếu root sai (`/var/www/tientienlorist/dist`), sẽ tìm tại `/var/www/tientienlorist/dist/uploads/image.jpg` → 404
- Nếu root đúng (`/var/www/tientienlorist`), sẽ tìm tại `/var/www/tientienlorist/uploads/image.jpg` → OK

---

✅ **Sau khi fix, ảnh sẽ hiển thị bình thường!**

---

## ⚠️ LỖI UPLOAD ẢNH >1MB

### Triệu chứng:
- Upload ảnh <1MB: ✅ OK
- Upload ảnh >1MB: ❌ Error "SyntaxError: Unexpected token '<'"

### Nguyên nhân:
Nginx mặc định giới hạn upload = **1MB**

### Giải pháp:

#### Bước 1: Edit Nginx config
```bash
sudo nano /etc/nginx/sites-available/YOUR_DOMAIN
```

#### Bước 2: Thêm client_max_body_size

Trong block `server {`, thêm:
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN;
    
    # THÊM DÒNG NÀY:
    client_max_body_size 10M;  # Cho phép upload tối đa 10MB
    
    # ... rest of config ...
}
```

#### Bước 3: Test và reload
```bash
# Test config
sudo nginx -t

# Reload nếu OK
sudo systemctl reload nginx
```

#### Bước 4: Test upload
- Upload ảnh >1MB
- Should work now! ✅

### Tăng thêm nếu cần:
- **20MB:** `client_max_body_size 20M;`
- **50MB:** `client_max_body_size 50M;`

---

✅ **Fix xong! Upload ảnh lớn đã hoạt động.**
