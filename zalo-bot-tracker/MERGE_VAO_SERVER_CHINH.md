# ✨ TÍCH HỢP ZALO BOT VÀO SERVER CHÍNH

> **Đơn giản hóa: Merge webhook vào server web hiện tại thay vì tạo server riêng**

## 📋 Các bước thực hiện:

### Bước 1: Thêm code vào server.js chính

Mở file server chính:
```bash
nano /var/www/tientienlorist/server.js
```

**Thêm vào phần đầu file (sau các require/import):**

```javascript
const axios = require('axios');
```

**Thêm vào CUỐI file (trước dòng cuối `app.listen` hoặc `.listen`):**

```javascript
// ============================================
// 🆕 ZALO BOT WEBHOOK & TRACKING
// ============================================
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const OWNER_ZALO_ID = process.env.OWNER_ZALO_ID || '';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'tientienflorist-secret-2026';
const SHOP_NAME = process.env.SHOP_NAME || 'Tientienflorist';

// Webhook endpoint - nhận events từ Zalo
app.post('/api/zalo-webhook', (req, res) => {
  try {
    const secretToken = req.headers['x-bot-api-secret-token'];
    if (secretToken !== WEBHOOK_SECRET) {
      console.log('⚠️ Webhook bị từ chối - Sai secret token');
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const body = req.body;
    console.log('📨 Nhận webhook từ Zalo:', JSON.stringify(body, null, 2));
    res.json({ message: 'Success' });
  } catch (error) {
    console.error('❌ Lỗi webhook:', error);
    res.status(500).json({ message: 'Error' });
  }
});

// Tracking endpoint - nhận click từ website
app.post('/api/track-click', async (req, res) => {
  try {
    const { productName, productUrl, productId } = req.body;
    
    if (!productName || !productUrl) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const time = new Date().toLocaleString('vi-VN', { 
      timeZone: 'Asia/Ho_Chi_Minh',
      dateStyle: 'short',
      timeStyle: 'medium'
    });
    
    // Format message
    let message = `🔔 [${SHOP_NAME}] THÔNG BÁO CLICK\n\n`;
    message += `📦 Sản phẩm: ${productName}\n`;
    message += `🔗 Link: ${productUrl}\n`;
    message += `⏰ Thời gian: ${time}\n`;
    if (productId) message += `🆔 ID: ${productId}\n`;
    if (userIp) message += `🌐 IP: ${userIp}\n`;

    // Gửi thông báo đến chủ shop qua Zalo Bot
    if (OWNER_ZALO_ID && BOT_TOKEN) {
      try {
        await axios.post(
          `https://bot-api.zaloplatforms.com/bot${BOT_TOKEN}/sendMessage`,
          { 
            chat_id: OWNER_ZALO_ID, 
            text: message 
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Đã gửi thông báo Zalo đến chủ shop');
      } catch (zaloError) {
        console.error('⚠️ Lỗi gửi Zalo:', zaloError.response?.data || zaloError.message);
      }
    }

    res.json({ success: true, message: 'Tracked successfully' });
  } catch (error) {
    console.error('❌ Lỗi track click:', error);
    res.status(500).json({ success: false, message: 'Error' });
  }
});
```

**Lưu file:** Ctrl+O, Enter, Ctrl+X

---

### Bước 2: Cập nhật file .env

```bash
nano /var/www/tientienlorist/.env
```

**Thêm vào cuối file:**

```bash
# ============================================
# ZALO BOT TRACKING
# ============================================
BOT_TOKEN=3090077098889577948F1bAmR8miCUvfDcjSJRyXwIytINpedyBUKVnKq9yCrAPJonBJHCJTGRWgKwrrVZ
OWNER_ZALO_ID=DIEN_USER_ID_CUA_BAN_VAO_DAY
WEBHOOK_SECRET=tientienflorist-secret-2026
SHOP_NAME=Tientienflorist
```

**Lưu file:** Ctrl+O, Enter, Ctrl+X

---

### Bước 3: Cài axios (nếu chưa có)

```bash
cd /var/www/tientienlorist
npm install axios
```

---

### Bước 4: Lấy User ID của bạn

**Cách 1: Dùng get-user-id.js (đơn giản nhất)**

```bash
# Tạm dừng server chính
pm2 stop all

# Chạy get-user-id
cd /var/www/tientienlorist/zalo-bot-tracker
node get-user-id.js

# Mở Zalo trên điện thoại → Nhắn tin cho bot
# Copy User ID hiện ra

# Ctrl+C để dừng
```

**Cách 2: Xem trong file .env.example của zalo-bot-tracker**

```bash
cat /var/www/tientienlorist/zalo-bot-tracker/.env
```

Nếu đã có OWNER_ZALO_ID ở đó, copy sang file .env chính.

**Sau khi có User ID, cập nhật:**

```bash
nano /var/www/tientienlorist/.env
# Sửa dòng OWNER_ZALO_ID=...
```

---

### Bước 5: Restart server

```bash
pm2 restart all
pm2 logs
```

Bạn sẽ thấy log khởi động server.

---

### Bước 6: Set Webhook trên Zalo

Vào https://bot.zapps.me → Bot Tientienflorist → Thiết lập chung:

- **Webhook URL:** `http://45.76.189.14:3001/api/zalo-webhook`
- **Secret Token:** `tientienflorist-secret-2026`
- Click **"Lưu thay đổi"**

---

### Bước 7: Cập nhật tracking URL trong website

Sửa file `utils/zaloBotTracking.ts`:

```typescript
// Thay đổi từ
const TRACKER_API_URL = 'https://YOUR_VPS_IP_OR_DOMAIN:3002/api/track-click';

// Thành
const TRACKER_API_URL = 'http://45.76.189.14:3001/api/track-click';
```

**Lưu file.**

---

### Bước 8: Build và deploy website

```bash
# Trên máy local Windows
cd e:\WEBTIENTIEN\tientienlorist
npm run build

# Upload dist/ lên VPS (dùng script deploy có sẵn)
```

---

### Bước 9: Test hệ thống

**Test 1: Kiểm tra API**

```bash
# Trên VPS
curl http://localhost:3001/api/track-click \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"productName":"Test Product","productUrl":"https://test.com"}'
```

**Kết quả mong đợi:** Nhận tin nhắn trên Zalo!

**Test 2: Click sản phẩm trên website**

1. Mở website
2. Click vào bất kỳ sản phẩm nào
3. Kiểm tra Zalo → Phải nhận được thông báo!

---

## ✅ Checklist

- [ ] Thêm code vào server.js
- [ ] Cập nhật .env với BOT_TOKEN và OWNER_ZALO_ID
- [ ] Cài axios
- [ ] Restart pm2
- [ ] Set webhook URL trên Zalo
- [ ] Cập nhật tracking URL trong frontend
- [ ] Build và deploy website
- [ ] Test nhận thông báo

---

## 🎯 Ưu điểm của cách này:

✅ Chỉ 1 server Node.js duy nhất
✅ Không cần mở port mới (dùng luôn 3001)
✅ Đơn giản hơn, dễ quản lý
✅ Không cần chạy nhiều process

---

## 🔧 Troubleshooting

### Không nhận được thông báo?

**Kiểm tra log:**
```bash
pm2 logs

# Phải thấy:
# ✅ Đã gửi thông báo Zalo đến chủ shop
```

**Nếu lỗi 401/403:**
- Kiểm tra BOT_TOKEN đúng chưa
- Kiểm tra OWNER_ZALO_ID đúng chưa

**Nếu không thấy log gì:**
- Webhook chưa được set đúng
- URL trong frontend chưa update

---

Làm từng bước và báo kết quả nhé! 🚀
