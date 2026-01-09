# 📚 HƯỚNG DẪN CÀI ĐẶT CHI TIẾT - ZALO BOT TRACKER

> **Dành cho người không biết lập trình** - Làm theo từng bước một cách cẩn thận

---

## 📋 MỤC LỤC

1. [Chuẩn bị](#1-chuẩn-bị)
2. [Cài đặt Node.js trên VPS](#2-cài-đặt-nodejs-trên-vps)
3. [Upload code lên VPS](#3-upload-code-lên-vps)
4. [Cấu hình hệ thống](#4-cấu-hình-hệ-thống)
5. [Lấy User ID của bạn](#5-lấy-user-id-của-bạn)
6. [Cấu hình Webhook trên Zalo](#6-cấu-hình-webhook-trên-zalo)
7. [Chạy server](#7-chạy-server)
8. [Nhúng tracking vào website](#8-nhúng-tracking-vào-website)
9. [Test hệ thống](#9-test-hệ-thống)
10. [Khắc phục sự cố](#10-khắc-phục-sự-cố)

---

## 1. CHUẨN BỊ

### Bạn cần có:

- ✅ **Zalo Bot** đã tạo (Bot Tientienflorist của bạn)
- ✅ **Bot Token** - Chuỗi dài bắt đầu bằng số (ví dụ: `3090077...`)
- ✅ **VPS** với hệ điều hành Linux (Ubuntu/CentOS)
- ✅ **Quyền truy cập SSH** vào VPS
- ✅ **Địa chỉ IP** hoặc **Domain** của VPS

### Lấy Bot Token:

1. Vào https://bot.zapps.me
2. Chọn bot **Bot Tientienflorist**
3. Copy toàn bộ token (chuỗi dài dưới phần "Vui lòng sử dụng token sau đề tích hợp HTTP API")

---

## 2. CÀI ĐẶT NODE.JS TRÊN VPS

### Bước 2.1: Kết nối SSH vào VPS

```bash
ssh root@YOUR_VPS_IP
```

*Thay `YOUR_VPS_IP` bằng IP thật của VPS*

### Bước 2.2: Cài đặt Node.js 22 LTS

```bash
# Cài Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load nvm
source ~/.bashrc

# Cài Node.js 22 LTS
nvm install 22

# Kiểm tra version
node --version
npm --version
```

Bạn sẽ thấy:
```
v22.x.x
10.x.x
```

✅ **Hoàn thành!** Node.js đã được cài đặt.

---

## 3. UPLOAD CODE LÊN VPS

### Cách 1: Sử dụng Git (Khuyên dùng)

```bash
# Di chuyển vào thư mục website
cd /var/www/tientienlorist

# Folder zalo-bot-tracker đã có sẵn trong project
cd zalo-bot-tracker
```

### Cách 2: Upload thủ công bằng FileZilla/WinSCP

1. Tải **WinSCP**: https://winscp.net/eng/download.php
2. Kết nối đến VPS:
   - Host: `YOUR_VPS_IP`
   - Port: `22`
   - Username: `root`
   - Password: `YOUR_PASSWORD`
3. Upload toàn bộ folder website `tientienlorist/` vào `/var/www/`
4. Folder `zalo-bot-tracker` sẽ nằm trong đó

### Bước 3.1: Vào thư mục project

```bash
cd /var/www/tientienlorist/zalo-bot-tracker
```

### Bước 3.2: Cài đặt dependencies

```bash
npm install
```

Chờ vài phút cho npm tải về các package cần thiết.

✅ **Hoàn thành!** Code đã sẵn sàng.

---

## 4. CẤU HÌNH HỆ THỐNG

### Bước 4.1: Tạo file .env

```bash
# Copy file mẫu
cp .env.example .env

# Mở file để chỉnh sửa
nano .env
```

### Bước 4.2: Điền thông tin

Trong file `.env`, điền các thông tin sau:

```bash
# Bot Token (copy từ Zalo Bot Platform)
BOT_TOKEN=3090077098889577948F1bAmR8miCUvfDcjSJRyXwIytINpedyBUKVnKq9yCrAPJonBJHCJTGRWgKwrrVZ

# User ID của bạn (sẽ lấy ở bước 5)
OWNER_ZALO_ID=CHUA_CO_THI_BO_TRONG

# Secret token (tự đặt một chuỗi bất kỳ)
WEBHOOK_SECRET=tientienflorist-secret-2026

# Port server
PORT=3002

# Lưu database
ENABLE_DATABASE=true

# Tên shop
SHOP_NAME=Tientienflorist
```

**Cách chỉnh sửa trong nano:**
- Di chuyển bằng phím mũi tên
- Nhập text bình thường
- **Ctrl + O** để lưu
- **Enter** để xác nhận
- **Ctrl + X** để thoát

✅ **Hoàn thành!** File cấu hình đã xong.

---

## 5. LẤY USER ID CỦA BẠN

### Bước 5.1: Chạy script helper

```bash
npm run get-user-id
```

Bạn sẽ thấy:

```
🔍 HELPER: Lấy User ID từ Zalo
=================================
📝 Hướng dẫn:
1. Server đang chạy và chờ webhook...
2. Mở Zalo và nhắn tin CHO BOT của bạn
3. User ID của bạn sẽ hiện ra bên dưới
4. Copy User ID đó và điền vào file .env
=================================

🚀 Server đang chạy tại: http://localhost:3003/webhook
⏳ Đang chờ bạn nhắn tin cho bot...
```

### Bước 5.2: Nhắn tin cho bot

1. **MỞ APP ZALO** trên điện thoại
2. Tìm bot **Bot Tientienflorist**
3. Nhắn tin bất kỳ, ví dụ: "Hello"

### Bước 5.3: Copy User ID

Sau khi nhắn tin, terminal sẽ hiện:

```
✅ ĐÃ NHẬN ĐƯỢC TIN NHẮN!
=================================
👤 Tên: Your Name
🆔 User ID: 6ede9afa66b88fe6d6a9
=================================

📋 Copy User ID này vào file .env:
OWNER_ZALO_ID=6ede9afa66b88fe6d6a9
```

**Copy User ID này!**

### Bước 5.4: Dừng script

Nhấn **Ctrl + C** để dừng script.

### Bước 5.5: Cập nhật file .env

```bash
nano .env
```

Tìm dòng `OWNER_ZALO_ID` và điền User ID vừa copy:

```bash
OWNER_ZALO_ID=6ede9afa66b88fe6d6a9
```

**Ctrl + O**, **Enter**, **Ctrl + X** để lưu và thoát.

✅ **Hoàn thành!** Đã có User ID.

---

## 6. CẤU HÌNH WEBHOOK TRÊN ZALO

### Bước 6.1: Xác định Webhook URL

Webhook URL có format:

```
https://YOUR_VPS_IP_OR_DOMAIN:3002/webhook
```

**Ví dụ:**
- Nếu VPS IP: `103.123.45.67` → `https://103.123.45.67:3002/webhook`
- Nếu có domain: `bot.tientienflorist.com` → `https://bot.tientienflorist.com:3002/webhook`

### Bước 6.2: Set webhook

**Cách 1: Dùng API (Khuyên dùng)**

Chạy lệnh sau trên VPS (thay `YOUR_BOT_TOKEN` và `YOUR_WEBHOOK_URL`):

```bash
curl -X POST https://bot-api.zaloplatforms.com/botYOUR_BOT_TOKEN/setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://YOUR_VPS_IP:3002/webhook",
    "secret_token": "tientienflorist-secret-2026"
  }'
```

**Cách 2: Qua Website**

Theo hướng dẫn tại: https://bot.zapps.me/docs/apis/setWebhook/

✅ **Hoàn thành!** Webhook đã được cấu hình.

---

## 7. CHẠY SERVER

### Bước 7.1: Cài đặt PM2 (Process Manager)

```bash
npm install -g pm2
```

### Bước 7.2: Chạy server với PM2

```bash
pm2 start server.js --name zalo-tracker
```

Bạn sẽ thấy:

```
┌─────┬──────────────┬─────────┬─────────┐
│ id  │ name         │ status  │ cpu     │
├─────┼──────────────┼─────────┼─────────┤
│ 0   │ zalo-tracker │ online  │ 0%      │
└─────┴──────────────┴─────────┴─────────┘
```

### Bước 7.3: Xem log

```bash
pm2 logs zalo-tracker
```

Bạn sẽ thấy:

```
=================================
🚀 Zalo Bot Tracker Server Started
=================================
📍 Port: 3002
🤖 Bot Token: ✅ Configured
👤 Owner ID: ✅ Configured
💾 Database: ✅ Enabled
=================================
```

### Bước 7.4: Lưu PM2 để tự khởi động lại

```bash
pm2 save
pm2 startup
```

✅ **Hoàn thành!** Server đang chạy 24/7.

---

## 8. NHÚNG TRACKING VÀO WEBSITE

### Bước 8.1: Upload tracking script

Upload file `tracking-script.js` lên web hosting của bạn, hoặc serve trực tiếp từ VPS.

**Serve từ VPS:** File đã có sẵn tại:
```
https://YOUR_VPS_IP:3002/tracking-script.js
```

### Bước 8.2: Chỉnh sửa tracking-script.js

Mở file `tracking-script.js`, tìm dòng:

```javascript
const TRACKER_API_URL = 'https://YOUR-VPS-IP-OR-DOMAIN:3002/api/track-click';
```

Thay bằng URL thật của bạn:

```javascript
const TRACKER_API_URL = 'https://103.123.45.67:3002/api/track-click';
```

### Bước 8.3: Nhúng script vào website

Thêm vào cuối thẻ `<body>` của website:

```html
<script src="https://103.123.45.67:3002/tracking-script.js"></script>
```

### Bước 8.4: Đánh dấu link sản phẩm

Thêm attributes vào các link sản phẩm:

```html
<a href="/products/hoa-hong"
   data-track="product"
   data-product-name="Hoa Hồng Đỏ"
   data-product-id="ROSE001">
  Xem chi tiết
</a>
```

**Giải thích:**
- `data-track="product"` - Bắt buộc, đánh dấu link cần tracking
- `data-product-name="..."` - Tên sản phẩm (hiện trong thông báo)
- `data-product-id="..."` - ID sản phẩm (tùy chọn)

✅ **Hoàn thành!** Website đã tích hợp tracking.

---

## 9. TEST HỆ THỐNG

### Test 1: Kiểm tra server

```bash
curl http://localhost:3002/health
```

Kết quả:

```json
{
  "status": "OK",
  "timestamp": "2026-01-05T08:00:00.000Z",
  "config": {
    "botConfigured": true,
    "ownerConfigured": true,
    "databaseEnabled": true
  }
}
```

### Test 2: Mở file demo

Truy cập:
```
https://YOUR_VPS_IP:3002/example-usage.html
```

Click vào bất kỳ sản phẩm nào.

### Test 3: Kiểm tra Zalo

Mở app Zalo, vào chat với bot **Bot Tientienflorist**.

Bạn sẽ nhận được thông báo:

```
🔔 [Tientienflorist] THÔNG BÁO CLICK

📦 Sản phẩm: Hoa Hồng Đỏ
🔗 Link: https://tientienflorist.com/products/hoa-hong-do
⏰ Thời gian: 05/01/2026, 15:30:00
🆔 ID: ROSE001
🌐 IP: 123.45.67.89
```

✅ **THÀNH CÔNG!** Hệ thống hoạt động hoàn hảo!

---

## 10. KHẮC PHỤC SỰ CỐ

### ❌ Không nhận được thông báo Zalo

**Nguyên nhân:**
1. Bot Token sai
2. Owner ID sai
3. Webhook chưa được set

**Giải pháp:**
```bash
# Kiểm tra log
pm2 logs zalo-tracker

# Kiểm tra config
cat .env

# Test gửi tin nhắn thủ công
curl -X POST https://bot-api.zaloplatforms.com/botYOUR_TOKEN/sendMessage \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "YOUR_OWNER_ID",
    "text": "Test message"
  }'
```

### ❌ Tracking script không hoạt động

**Giải pháp:**
1. F12 mở Console trong trình duyệt
2. Xem có lỗi CORS không
3. Kiểm tra URL trong `TRACKER_API_URL` có đúng không
4. Thêm CORS cho domain của bạn trong `server.js`

### ❌ Server bị tắt

**Khởi động lại:**
```bash
pm2 restart zalo-tracker
```

### ❌ Port 3002 bị block

**Mở port trên firewall:**
```bash
# UFW (Ubuntu)
sudo ufw allow 3002

# Firewalld (CentOS)
sudo firewall-cmd --add-port=3002/tcp --permanent
sudo firewall-cmd --reload
```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:

1. **Xem log:** `pm2 logs zalo-tracker`
2. **Kiểm tra health:** `curl http://localhost:3002/health`
3. **Xem thống kê:** `curl http://localhost:3002/api/stats`

---

## 🎉 HOÀN TẤT!

Giờ đây mỗi khi khách hàng click vào link sản phẩm, bạn sẽ nhận được thông báo ngay lập tức qua Zalo Bot! 🚀
