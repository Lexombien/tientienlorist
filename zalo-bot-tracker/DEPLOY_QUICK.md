# 🚀 QUICK DEPLOY - Zalo Bot Tracker

> **Hướng dẫn nhanh deploy server tracking lên VPS**

## 📍 Đường Dẫn Trên VPS

```
/var/www/tientienlorist/
├── zalo-bot-tracker/        ← Backend server (folder này)
│   ├── server.js
│   ├── database.js
│   ├── package.json
│   └── .env
├── App.tsx
├── components/
└── utils/
    └── zaloBotTracking.ts   ← Frontend tracking
```

## ⚡ Quick Steps

### 1. SSH vào VPS

```bash
ssh root@YOUR_VPS_IP
```

### 2. Vào thư mục project

```bash
cd /var/www/tientienlorist/zalo-bot-tracker
```

### 3. Cài dependencies

```bash
npm install
```

### 4. Cấu hình .env

```bash
cp .env.example .env
nano .env
```

Điền:
- `BOT_TOKEN` - Từ https://bot.zapps.me
- `WEBHOOK_SECRET` - Tự đặt (ví dụ: `tientienflorist-secret-2026`)
- `SHOP_NAME` - `Tientienflorist`

### 5. Lấy User ID

```bash
npm run get-user-id
```

Sau đó **nhắn tin cho bot trên Zalo** → Copy User ID hiện ra

Cập nhật vào .env:
```bash
nano .env
# Thêm dòng: OWNER_ZALO_ID=YOUR_USER_ID
```

### 6. Set Webhook

```bash
curl -X POST "https://bot-api.zaloplatforms.com/bot{BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://YOUR_VPS_IP:3002/webhook",
    "secret_token": "tientienflorist-secret-2026"
  }'
```

*Thay `{BOT_TOKEN}` và `YOUR_VPS_IP` bằng giá trị thật*

### 7. Chạy Server

```bash
pm2 start server.js --name zalo-tracker
pm2 save
pm2 startup
```

### 8. Kiểm tra

```bash
pm2 status
pm2 logs zalo-tracker
```

### 9. Test API

```bash
curl http://localhost:3002/health
```

Should return:
```json
{
  "status": "OK",
  "config": {
    "botConfigured": true,
    "ownerConfigured": true,
    "databaseEnabled": true
  }
}
```

## ✅ Done!

Server đang chạy tại `https://YOUR_VPS_IP:3002`

Giờ cập nhật URL trong frontend: `utils/zaloBotTracking.ts`

---

**Xem chi tiết:** [HUONG_DAN_CAI_DAT.md](./HUONG_DAN_CAI_DAT.md)
