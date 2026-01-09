# 🤖 Zalo Bot Product Click Tracker

Hệ thống theo dõi khách hàng click vào link sản phẩm và tự động gửi thông báo đến chủ shop qua Zalo Bot.

> **Lưu ý:** Đây là subfolder trong project website Tientienflorist. Trên VPS sẽ nằm tại `/var/www/tientienlorist/zalo-bot-tracker/`

## ✨ Tính năng

- 🔔 **Thông báo real-time** - Nhận thông báo ngay khi khách click vào sản phẩm
- 💾 **Lưu lịch sử** - Tracking tất cả các click vào database SQLite
- 📊 **Thống kê** - Xem số lượng click theo sản phẩm
- 🚀 **Dễ tích hợp** - Chỉ cần thêm vài dòng HTML
- 🔒 **Bảo mật** - Webhook được bảo vệ bằng secret token

## 📁 Cấu trúc Project

```
zalo-bot-tracker/
├── server.js              # Server chính
├── database.js            # Quản lý SQLite database
├── get-user-id.js         # Helper lấy Zalo User ID
├── tracking-script.js     # Script nhúng vào website
├── example-usage.html     # Demo trang web
├── package.json           # Dependencies
├── .env.example           # Template cấu hình
├── .gitignore            # Git ignore
├── HUONG_DAN_CAI_DAT.md  # Hướng dẫn cài đặt chi tiết (Tiếng Việt)
└── README.md             # File này
```

## 🚀 Quick Start

### 1. Cài đặt

```bash
npm install
```

### 2. Cấu hình

```bash
cp .env.example .env
nano .env
```

Điền các thông tin:
- `BOT_TOKEN` - Token từ Zalo Bot Platform
- `OWNER_ZALO_ID` - User ID Zalo của bạn
- `WEBHOOK_SECRET` - Secret token tự đặt
- `PORT` - Port server (mặc định 3002)

### 3. Lấy User ID

```bash
npm run get-user-id
```

Sau đó nhắn tin cho bot trên Zalo để lấy User ID.

### 4. Chạy server

```bash
# Development
npm run dev

# Production
npm start

# Hoặc dùng PM2
pm2 start server.js --name zalo-tracker
```

### 5. Cấu hình Webhook

Set webhook URL trên Zalo Bot Platform:

```bash
curl -X POST https://bot-api.zaloplatforms.com/bot{BOT_TOKEN}/setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://YOUR_DOMAIN:3002/webhook",
    "secret_token": "your-secret-token"
  }'
```

### 6. Nhúng vào website

Thêm vào cuối thẻ `<body>`:

```html
<script src="https://YOUR_DOMAIN:3002/tracking-script.js"></script>
```

Đánh dấu link sản phẩm:

```html
<a href="/products/hoa-hong"
   data-track="product"
   data-product-name="Hoa Hồng Đỏ"
   data-product-id="ROSE001">
  Xem chi tiết
</a>
```

## 📚 Tài liệu

### API Endpoints

#### POST `/webhook`
Nhận webhook events từ Zalo.

**Headers:**
- `X-Bot-Api-Secret-Token`: Secret token

#### POST `/api/track-click`
Track click từ website.

**Body:**
```json
{
  "productName": "Hoa Hồng Đỏ",
  "productUrl": "https://shop.com/products/rose",
  "productId": "ROSE001"
}
```

#### GET `/api/stats`
Lấy thống kê click.

#### GET `/health`
Health check.

### Environment Variables

| Variable | Bắt buộc | Mô tả |
|----------|----------|-------|
| `BOT_TOKEN` | ✅ | Token từ Zalo Bot |
| `OWNER_ZALO_ID` | ✅ | User ID của chủ shop |
| `WEBHOOK_SECRET` | ✅ | Secret để bảo mật webhook |
| `PORT` | ❌ | Port server (default: 3002) |
| `ENABLE_DATABASE` | ❌ | Lưu database (default: true) |
| `SHOP_NAME` | ❌ | Tên shop (default: Shop) |

## 🔧 Troubleshooting

### Không nhận được thông báo Zalo

1. Kiểm tra `BOT_TOKEN` và `OWNER_ZALO_ID` đúng chưa
2. Xem log: `pm2 logs zalo-tracker`
3. Test API trực tiếp:

```bash
curl -X POST https://bot-api.zaloplatforms.com/bot{TOKEN}/sendMessage \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "YOUR_ID", "text": "Test"}'
```

### Tracking không hoạt động

1. Mở F12 Console trong trình duyệt
2. Kiểm tra CORS errors
3. Verify `TRACKER_API_URL` trong `tracking-script.js`

### Server bị tắt

```bash
pm2 restart zalo-tracker
pm2 logs zalo-tracker
```

## 📖 Hướng dẫn chi tiết

Xem file [HUONG_DAN_CAI_DAT.md](./HUONG_DAN_CAI_DAT.md) để có hướng dẫn từng bước chi tiết bằng tiếng Việt (dành cho người không biết lập trình).

## 🔗 Links

- [Zalo Bot Platform Documentation](https://bot.zapps.me/docs/)
- [Webhook Guide](https://bot.zapps.me/docs/webhook)
- [Send Message API](https://bot.zapps.me/docs/apis/sendMessage)

## 📄 License

MIT

## 👨‍💻 Author

Created for **Tientienflorist** shop tracking system.
