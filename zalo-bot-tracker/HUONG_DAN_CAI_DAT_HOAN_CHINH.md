# 🚀 HƯỚNG DẪN CÀI ĐẶT ZALO BOT TRACKING - HOÀN CHỈNH

> **Hệ thống theo dõi click sản phẩm và gửi thông báo qua Zalo Bot**

## 📋 MỤC LỤC

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Chuẩn bị](#chuẩn-bị)
3. [Cài đặt Backend](#cài-đặt-backend)
4. [Lấy Zalo User ID](#lấy-zalo-user-id)
5. [Cấu hình Frontend](#cấu-hình-frontend)
6. [Test hệ thống](#test-hệ-thống)
7. [Deploy lên Production](#deploy-lên-production)
8. [Troubleshooting](#troubleshooting)

---

## ✅ YÊU CẦU HỆ THỐNG

- ✅ VPS có Ubuntu/Debian
- ✅ Node.js 18+ đã cài
- ✅ PM2 đã cài
- ✅ Website React đang chạy
- ✅ Đã có Zalo Bot (tạo tại https://bot.zapps.me)

---

## 🔧 CHUẨN BỊ

### 1. Thông tin cần có:

- **Bot Token:** Lấy từ https://bot.zapps.me → Bot của bạn → Settings
- **VPS IP:** IP của VPS (ví dụ: `45.76.189.14`)
- **Port server:** Mặc định `3001`

### 2. SSH vào VPS:

```bash
ssh root@YOUR_VPS_IP
```

---

## 📦 CÀI ĐẶT BACKEND

> **Lưu ý:** Code đã được tích hợp SẴN vào `server.js` chính rồi!

### Bước 1: Cài axios (nếu chưa có)

```bash
cd /var/www/tientienlorist
npm install axios
```

### Bước 2: Cấu hình file .env

```bash
# Copy template
cp .env.example .env

# Sửa file .env
nano .env
```

**Thêm vào cuối file:**

```bash
# ZALO BOT TRACKING
BOT_TOKEN=3090079708889577948:WumpeIcImCEOqynlXvuncOOsbxxdOpCyxBpNihQFoTtOzqTGXKSWKIkevToDoMVL
OWNER_ZALO_ID=temp
WEBHOOK_SECRET=tientienflorist-secret-2026
SHOP_NAME=Tientienflorist
```
HIỆN TẠI: # ZALO BOT TRACKING
BOT_TOKEN=3090079708889577948:WumpeIcImCEOqynlXvuncOOsbxxdOpCyxBpNihQFoTtOzqTGXKSWKIkevToDoMVL
OWNER_ZALO_IDS=70fa4fe1d7b43eea67a5,95dfaa42990870562919
WEBHOOK_SECRET=tientienflorist-secret-2026
SHOP_NAME=Tientienflorist

**Lưu:** Ctrl+O, Enter, Ctrl+X

### Bước 3: Restart server

```bash
pm2 restart all
pm2 logs
```

**Kiểm tra log, phải thấy:**

```
🤖 Zalo Bot Tracking:
   - Bot Token: ✅ Configured
   - Owner ID: ✅ Configured (hoặc ❌ Missing - OK vì chưa có ID)
```

---

## 🆔 LẤY ZALO USER ID

> **Quan trọng:** Cần HTTPS để Zalo gửi webhook! Dùng Cloudflare Tunnel.

### Bước 1: Cài Cloudflare Tunnel

```bash
cd ~
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

### Bước 2: Chạy Cloudflare Tunnel

```bash
cloudflared tunnel --url http://localhost:3001
```

**Terminal sẽ hiện:**

```
Your quick Tunnel has been created! Visit it at:
https://abc-xyz-123.trycloudflare.com
```

**📋 Copy URL HTTPS này!** (ví dụ: `https://abc-xyz-123.trycloudflare.com`)

**⚠️ QUAN TRỌNG:** Giữ terminal này chạy! Đừng tắt!

### Bước 3: Mở SSH session mới để xem log

**Mở terminal/tab mới:**

```bash
ssh root@YOUR_VPS_IP
pm2 logs tientienlorist
# Hoặc đơn giản: pm2 logs
```

Giữ terminal này để xem log real-time.

### Bước 4: Set Webhook trên Zalo

1. Vào **https://bot.zapps.me**
2. Đăng nhập
3. Chọn bot **"Bot Tientienflorist"**
4. Tab **"Thiết lập chung"** hoặc **"Settings"**
5. Điền:
   - **Webhook URL:** `https://abc-xyz-123.trycloudflare.com/api/zalo-webhook`
   
   ⚠️ **QUAN TRỌNG:** Phải thêm `/api/zalo-webhook` vào cuối URL từ Cloudflare!
   
   **Ví dụ:**
   - ❌ SAI: `https://grow-fame-stands-reflect.trycloudflare.com`
   - ✅ ĐÚNG: `https://grow-fame-stands-reflect.trycloudflare.com/api/zalo-webhook`
   
   - **Secret Token:** `tientienflorist-secret-2026`
6. Click **"Lưu thay đổi"** hoặc **"Save"**

### Bước 5: Nhắn tin cho bot để lấy User ID

1. Mở **Zalo app** trên điện thoại
2. Tìm kiếm **"Bot Tientienflorist"**
3. Gửi tin nhắn: **"Hello"**

### Bước 6: Lấy User ID từ log

**Xem terminal đang chạy `pm2 logs`**, bạn sẽ thấy:

```
📨 ===== WEBHOOK NHẬN TỪ ZALO =====
{...}

🆔 ===== THÔNG TIN USER =====
USER ID: 1234567890123456789
Tên: Your Name

📋 Copy User ID này vào file .env:
OWNER_ZALO_ID=1234567890123456789
================================
```

**📋 Copy User ID** (ví dụ: `1234567890123456789`)

### Bước 7: Cập nhật User ID vào .env

**Mở SSH session mới (hoặc Ctrl+C terminal log):**

```bash
nano /var/www/tientienlorist/.env
```

**Tìm dòng:**
```bash
OWNER_ZALO_ID=temp
```

**Thay bằng:**
```bash
OWNER_ZALO_ID=1234567890123456789
```
*(ID thật bạn vừa copy)*

**Lưu:** Ctrl+O, Enter, Ctrl+X

### Bước 8: Restart server

```bash
pm2 restart all
pm2 logs
```

**Kiểm tra log:**
```
- Owner IDs: ✅ 1 người (hoặc số lượng IDs bạn đã thêm)
```

### Bước 9: Thêm nhiều Owner IDs cho team (Tùy chọn)

> **Dùng khi:** Công ty có nhiều người cần nhận thông báo đơn hàng cùng lúc

**Bước 9.1: Mỗi nhân viên nhắn tin cho Bot**

1. Nhân viên A: Mở Zalo → Tìm bot → Gửi "Hello"
2. Nhân viên B: Mở Zalo → Tìm bot → Gửi "Xin chào"
3. Nhân viên C: Mở Zalo → Tìm bot → Gửi "Hi"

**Bước 9.2: Lấy tất cả User IDs từ log**

```bash
pm2 logs tientienlorist --lines 100 | grep "USER ID"
```

**Kết quả ví dụ:**
```
USER ID: 70fa4fe1d7b43eea67a5  ← Nhân viên A
USER ID: abc123def456xyz       ← Nhân viên B  
USER ID: 789ghi012jkl345       ← Nhân viên C
```

**📋 Copy tất cả IDs**

**Bước 9.3: Cập nhật .env với nhiều IDs**

```bash
nano /var/www/tientienlorist/.env
```

**Tìm dòng:**
```bash
OWNER_ZALO_ID=70fa4fe1d7b43eea67a5
```

**Đổi thành (QUAN TRỌNG: Đổi tên biến + thêm chữ S):**
```bash
OWNER_ZALO_IDS=70fa4fe1d7b43eea67a5,abc123def456xyz,789ghi012jkl345
```

**Lưu ý:**
- ✅ Đổi `OWNER_ZALO_ID` → `OWNER_ZALO_IDS` (thêm chữ **S**)
- ✅ Phân cách bằng dấu phẩy `,` KHÔNG có khoảng trắng
- ✅ Có thể thêm bao nhiêu IDs cũng được

**Ví dụ cụ thể với 2 người:**
```bash
# ZALO BOT TRACKING
BOT_TOKEN=3090079708889577948:WumpeIcImCEOqynlXvuncOOsbxxdOpCyxBpNihQFoTtOzqTGXKSWKIkevToDoMVL
OWNER_ZALO_IDS=70fa4fe1d7b43eea67a5,95dfaa42990870562919
WEBHOOK_SECRET=tientienflorist-secret-2026
SHOP_NAME=Tientienflorist
```

**Lưu:** Ctrl+O, Enter, Ctrl+X

**Bước 9.4: Restart server**

```bash
pm2 restart all --update-env
pm2 logs
```

**Kiểm tra log phải thấy:**
```
🤖 Zalo Bot Tracking:
   - Owner IDs: ✅ 3 người  ← Số người bạn đã thêm
```

**Bước 9.5: Test gửi thông báo**

```bash
curl -X POST http://localhost:3001/api/track-click \
  -H "Content-Type: application/json" \
  -d '{"productName":"Test Team","productUrl":"https://zalo.me/test","productId":"team123"}'
```

**Kiểm tra logs:**
```bash
pm2 logs --lines 20
```

**Phải thấy:**
```
📤 Gửi thông báo đến 3 người...
✅ Đã gửi thông báo Zalo đến 70fa4fe1d7b43eea67a5
✅ Đã gửi thông báo Zalo đến abc123def456xyz
✅ Đã gửi thông báo Zalo đến 789ghi012jkl345
```

**✅ TẤT CẢ NHÂN VIÊN ĐỀU NHẬN ĐƯỢC THÔNG BÁO!**

**Bước 9.6: Thêm/Xóa người sau này**

Muốn thêm nhân viên mới:
```bash
nano /var/www/tientienlorist/.env

# Thêm ID mới vào cuối
OWNER_ZALO_IDS=id1,id2,id3,id_moi

# Restart
pm2 restart all --update-env
```

Muốn xóa người:
```bash
# Xóa ID không cần nữa khỏi danh sách
OWNER_ZALO_IDS=id1,id3  # Bỏ id2
```

**✅ XONG PHẦN BACKEND!**

---

## 🌐 CẤU HÌNH FRONTEND

### Bước 1: Cập nhật tracking URL

**File:** `e:\WEBTIENTIEN\tientienlorist\utils\zaloBotTracking.ts`

**Tìm dòng:**
```typescript
const TRACKER_API_URL = 'https://YOUR_VPS_IP_OR_DOMAIN:3002/api/track-click';
```

**Thay bằng:**
```typescript
const TRACKER_API_URL = 'http://45.76.189.14:3001/api/track-click';
```
*(Thay IP bằng IP thật của VPS)*

**Lưu file.**

### Bước 2: Build website

```bash
# Trên máy local Windows
cd e:\WEBTIENTIEN\tientienlorist
npm run build
```

### Bước 3: Deploy lên VPS

Sử dụng script auto-update có sẵn hoặc upload thủ công folder `dist/`.

---

## ✅ TEST HỆ THỐNG

### Test 1: Gửi thông báo test

```bash
# Trên VPS
curl -X POST http://localhost:3001/api/track-click \
  -H "Content-Type: application/json" \
  -d '{"productName":"🌹 Hoa Test","productUrl":"https://zalo.me/test","productId":"test123"}'
```

**→ Kiểm tra Zalo trên điện thoại, bạn sẽ nhận thông báo:**

```
🔔 [Tientienflorist] THÔNG BÁO CLICK

📦 Sản phẩm: 🌹 Hoa Test
🔗 Link: https://zalo.me/test
⏰ Thời gian: 05/01/2026, 17:00:00
🆔 ID: test123
🌐 IP: 127.0.0.1
```

**🎉 Nếu nhận được → Backend hoạt động!**

### Test 2: Click sản phẩm trên website

1. Mở website
2. Click vào bất kỳ sản phẩm nào
3. Kiểm tra Zalo

**→ Phải nhận được thông báo với thông tin sản phẩm thật!**

---

## 🚀 DEPLOY LÊN PRODUCTION

### Option 1: Sử dụng HTTP (Đơn giản)

Webhook URL: `http://YOUR_VPS_IP:3001/api/zalo-webhook`

**Ưu điểm:**
- Đơn giản, không cần setup thêm

**Nhược điểm:**
- Một số bot platform có thể yêu cầu HTTPS

### Option 2: Setup SSL với Let's Encrypt (Khuyên dùng)

**Nếu có domain trỏ về VPS:**

```bash
# Cài Certbot
sudo apt install certbot python3-certbot-nginx

# Lấy SSL certificate
sudo certbot --nginx -d yourdomain.com

# Webhook URL sẽ là:
# https://yourdomain.com/api/zalo-webhook
```

### Option 3: Dùng Cloudflare Tunnel vĩnh viễn

```bash
# Tạo tunnel có tên
cloudflare tunnel login
cloudflare tunnel create tientienlorist
cloudflare tunnel route dns tientienlorist bot.yourdomain.com
cloudflare tunnel run tientienlorist

# Webhook URL:
# https://bot.yourdomain.com/api/zalo-webhook
```

---

## 🔧 TROUBLESHOOTING

### ❌ Không nhận được thông báo

**Kiểm tra:**

1. **Server có chạy không?**
   ```bash
   pm2 status
   # Phải thấy "tientienlorist" online
   ```

2. **Bot Token đúng chưa?**
   ```bash
   curl "https://bot-api.zaloplatforms.com/bot{BOT_TOKEN}/getMe"
   # Phải trả về thông tin bot
   ```

3. **OWNER_ZALO_ID đúng chưa?**
   ```bash
   cat /var/www/tientienlorist/.env | grep OWNER_ZALO_ID
   ```

4. **Webhook có set chưa?**
   ```bash
   curl "https://bot-api.zaloplatforms.com/bot{BOT_TOKEN}/getWebhookInfo"
   # Phải thấy URL webhook
   ```

5. **Test endpoint trực tiếp:**
   ```bash
   curl http://localhost:3001/api/health
   # Phải thấy: {"status":"OK",...,"zaloBotConfigured":true}
   ```

### ❌ Webhook không nhận được từ Zalo

**Nguyên nhân:** Zalo yêu cầu HTTPS

**Giải pháp:** Dùng Cloudflare Tunnel (xem phần "Lấy Zalo User ID")

### ❌ Port bị block

```bash
# Mở port 3001
sudo ufw allow 3001/tcp
sudo ufw reload

# Hoặc check Vultr firewall trên Control Panel
```

---

## 📝 CHECKLIST ĐẦY ĐỦ

### Backend Setup
- [ ] Cài axios: `npm install axios`
- [ ] Copy .env.example thành .env
- [ ] Điền BOT_TOKEN vào .env
- [ ] Restart server: `pm2 restart all`
- [ ] Check log: Bot Token ✅ Configured

### Lấy User ID
- [ ] Cài Cloudflare Tunnel
- [ ] Chạy: `cloudflared tunnel --url http://localhost:3001`
- [ ] Copy URL HTTPS
- [ ] Set webhook trên https://bot.zapps.me
- [ ] Nhắn tin cho bot trên Zalo
- [ ] Copy User ID từ log
- [ ] Cập nhật OWNER_ZALO_ID vào .env
- [ ] Restart: `pm2 restart all`

### Frontend Setup
- [ ] Sửa `utils/zaloBotTracking.ts` với URL đúng
- [ ] Build: `npm run build`
- [ ] Deploy lên VPS

### Testing
- [ ] Test curl gửi thông báo → Nhận trên Zalo ✅
- [ ] Click sản phẩm trên website → Nhận thông báo ✅

---

## 🎉 HOÀN TẤT!

Giờ mỗi khi khách hàng click vào sản phẩm, bạn sẽ nhận thông báo ngay trên Zalo! 

**Cần hỗ trợ?**
- Xem file `DEBUG.md` để troubleshoot
- Xem file `MERGE_VAO_SERVER_CHINH.md` để hiểu cách hoạt động

**Chúc bạn bán hàng thành công! 🚀**
