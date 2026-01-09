# 🚀 TÍCH HỢP ZALO BOT TRACKING VÀO WEBSITE

## ✅ Đã Hoàn Thành

Mình đã tích hợp **Zalo Bot Tracking** vào website của bạn rồi! Giờ khi khách click vào sản phẩm, bạn sẽ nhận được thông báo qua Zalo ngay lập tức.

### Các file đã thay đổi:

1. ✅ **[FlowerCard.tsx](file:///e:/WEBTIENTIEN/tientienlorist/components/FlowerCard.tsx)** - Thêm tracking khi click sản phẩm
2. ✅ **[zaloBotTracking.ts](file:///e:/WEBTIENTIEN/tientienlorist/utils/zaloBotTracking.ts)** - Utility gửi tracking data

### Cách hoạt động:

```
Khách click sản phẩm 
    ↓
FlowerCard.handleZaloRedirect() / handleImageClick()
    ↓
trackZaloBotClick() gửi request đến VPS
    ↓
VPS server nhận request
    ↓
Bot gửi thông báo đến Zalo của bạn
    ↓
Bạn nhận thông báo real-time! 🔔
```

---

## 📝 CÁC BƯỚC TIẾP THEO

### Bước 1: Deploy Server lên VPS

Làm theo file [HUONG_DAN_CAI_DAT.md](file:///e:/WEBTIENTIEN/tientienlorist/zalo-bot-tracker/HUONG_DAN_CAI_DAT.md) trong thư mục `zalo-bot-tracker/`

**Tóm tắt nhanh:**

```bash
# 1. SSH vào VPS
ssh root@YOUR_VPS_IP

# 2. Cài Node.js 22 LTS
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 22

# 3. Code đã có sẵn trong project website
cd /var/www/tientienlorist

# 4. Cài dependencies cho zalo-bot-tracker
cd zalo-bot-tracker
npm install

# 5. Cấu hình file .env
cp .env.example .env
nano .env
# Điền: BOT_TOKEN, OWNER_ZALO_ID, WEBHOOK_SECRET

# 6. Lấy User ID của bạn
npm run get-user-id
# Sau đó nhắn tin cho bot trên Zalo để lấy ID

# 7. Chạy server
pm2 start server.js --name zalo-tracker
pm2 save
```

### Bước 2: Cập nhật URL Tracking trong Website

Sau khi server chạy thành công, cập nhật file [zaloBotTracking.ts](file:///e:/WEBTIENTIEN/tientienlorist/utils/zaloBotTracking.ts):

**Tìm dòng này:**
```typescript
const TRACKER_API_URL = 'https://YOUR_VPS_IP_OR_DOMAIN:3002/api/track-click';
```

**Thay bằng:**
```typescript
const TRACKER_API_URL = 'https://103.xxx.xxx.xxx:3002/api/track-click';
// Hoặc nếu có domain:
const TRACKER_API_URL = 'https://bot.tientienflorist.com:3002/api/track-click';
```

### Bước 3: Build và Deploy Website

```bash
# Trên máy local
cd e:\WEBTIENTIEN\tientienlorist
npm run build

# Upload lên VPS (hoặc dùng auto-deploy script có sẵn)
```

### Bước 4: Test Hệ Thống

1. **Mở website** của bạn trên trình duyệt
2. **Click vào bất kỳ sản phẩm nào**
3. **Kiểm tra Zalo** - Bạn sẽ nhận được thông báo:

```
🔔 [Tientienflorist] THÔNG BÁO CLICK

📦 Sản phẩm: Hoa Hồng Đỏ
🔗 Link: https://zalo.me/0900000000
⏰ Thời gian: 05/01/2026, 15:30:00
🆔 ID: product123
🌐 IP: 123.45.67.89
```

---

## 🔧 Khắc Phục Sự Cố

### ❌ Không nhận được thông báo?

**Kiểm tra:**

1. **Server có chạy không?**
   ```bash
   ssh root@VPS_IP
   pm2 status
   # Phải thấy "zalo-tracker" status "online"
   ```

2. **Bot Token đúng chưa?**
   ```bash
   cat /var/www/tientienlorist/zalo-bot-tracker/.env
   # Kiểm tra BOT_TOKEN và OWNER_ZALO_ID
   ```

3. **URL tracking đúng chưa?**
   - Mở F12 Console trên website
   - Click sản phẩm
   - Xem có lỗi CORS hoặc network error không

4. **Test trực tiếp API:**
   ```bash
   curl -X POST https://YOUR_VPS_IP:3002/api/track-click \
     -H "Content-Type: application/json" \
     -d '{"productName":"Test","productUrl":"https://test.com"}'
   ```

### ❌ Lỗi CORS?

Thêm domain của bạn vào CORS trong [server.js](file:///e:/WEBTIENTIEN/tientienlorist/zalo-bot-tracker/server.js):

```javascript
app.use(cors({
  origin: ['https://tientienflorist.com', 'http://localhost:5173']
}));
```

---

## 📊 Các Tính Năng Đã Tích Hợp

✅ **Tracking khi click button "ĐẶT NGAY"**
✅ **Tracking khi click vào ảnh sản phẩm**
✅ **Tracking khi click vào tên sản phẩm**
✅ **Không tracking ở mode Admin**
✅ **Silent fail** - Không ảnh hưởng UX nếu server lỗi

---

## 🎯 Bước Nâng Cao (Tùy chọn)

### Lưu URL tracking vào Global Settings

Thay vì hardcode URL, bạn có thể thêm vào `globalSettings`:

**1. Thêm vào App.tsx:**
```typescript
const [globalSettings, setGlobalSettings] = useState({
  // ... existing settings
  zaloBotTrackingUrl: 'https://YOUR_VPS_IP:3002/api/track-click'
});
```

**2. Chỉnh sửa zaloBotTracking.ts:**
```typescript
export async function trackZaloBotClick(
  productName: string, 
  productUrl: string, 
  productId?: string,
  customUrl?: string  // NEW
) {
  const TRACKER_API_URL = customUrl || 'https://YOUR_VPS_IP:3002/api/track-click';
  // ... rest of code
}
```

**3. Gọi từ FlowerCard:**
```typescript
trackZaloBotClick(product.title, zaloLink, product.id, globalSettings.zaloBotTrackingUrl);
```

---

## ✨ Hoàn Tất!

Giờ mỗi khi khách hàng click vào sản phẩm, bạn sẽ biết ngay! 🎉

**Cần hỗ trợ thêm?**
- Xem [HUONG_DAN_CAI_DAT.md](file:///e:/WEBTIENTIEN/tientienlorist/zalo-bot-tracker/HUONG_DAN_CAI_DAT.md) - Hướng dẫn deploy chi tiết
- Xem [README.md](file:///e:/WEBTIENTIEN/tientienlorist/zalo-bot-tracker/README.md) - Technical documentation
