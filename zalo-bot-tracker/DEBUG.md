# 🔧 DEBUG - Zalo Bot Webhook

## Tình trạng hiện tại:

✅ Server đã chạy (port 3002)
✅ Webhook URL đã set: `http://45.76.189.14:3002/webhook`
✅ Secret token đã set: `tientienflorist-secret-2026`
❓ Chưa nhận được thông báo

---

## Các bước debug:

### 1. Kiểm tra Firewall (QUAN TRỌNG!)

Port 3002 có thể bị block. Chạy lệnh này trên VPS:

```bash
# Kiểm tra port có mở không
sudo netstat -tlnp | grep 3002

# Mở port 3002 (Ubuntu/Debian)
sudo ufw allow 3002
sudo ufw reload

# Hoặc (CentOS/AlmaLinux)
sudo firewall-cmd --add-port=3002/tcp --permanent
sudo firewall-cmd --reload

# Kiểm tra lại
sudo ufw status
```

### 2. Test từ bên ngoài

Từ máy local (Windows), mở PowerShell:

```powershell
curl http://45.76.189.14:3002/health
```

**Kết quả mong đợi:**
```json
{"status":"OK","timestamp":"...","config":{...}}
```

**Nếu timeout hoặc không kết nối được** → Firewall đang block!

### 3. Kiểm tra Server Log

Trên VPS, xem log server:

```bash
# Terminal đang chạy server sẽ hiện log khi có request
# Nếu không thấy gì → webhook không đến được server
```

### 4. Test Webhook từ Zalo

**Bước 1:** Click nút **"Lưu thay đổi"** (button xanh) trên trang bot

**Bước 2:** Mở Zalo app trên điện thoại

**Bước 3:** Tìm "Bot Tientienflorist"

**Bước 4:** Gửi tin nhắn: "Test"

**Bước 5:** Xem terminal VPS có hiện log không:

```
📨 Nhận webhook: {...}
```

### 5. Test API trực tiếp

Thử gửi message thủ công để xem bot có hoạt động không:

```bash
# Lấy User ID từ file .env
cat /var/www/tientienlorist/zalo-bot-tracker/.env | grep OWNER_ZALO_ID

# Test gửi tin nhắn (thay YOUR_USER_ID)
curl -X POST "https://bot-api.zaloplatforms.com/bot3090077098889577948F1bAmR8miCUvfDcjSJRyXwIytINpedyBUKVnKq9yCrAPJonBJHCJTGRWgKwrrVZ/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "YOUR_USER_ID",
    "text": "🔔 Test thông báo từ server!"
  }'
```

Nếu nhận được tin nhắn → Bot API OK, vấn đề chỉ ở webhook!

---

## Giải pháp nhanh: Dùng PM2 và check log

```bash
# Dừng server hiện tại (Ctrl+C)

# Chạy với PM2 để dễ xem log
pm2 start server.js --name zalo-tracker
pm2 logs zalo-tracker --lines 50

# Giờ nhắn tin cho bot, xem log real-time
```

---

## Checklist Debug:

- [ ] Firewall đã mở port 3002
- [ ] Test `curl http://45.76.189.14:3002/health` từ bên ngoài → OK
- [ ] Đã click "Lưu thay đổi" trên trang bot
- [ ] Đã nhắn tin cho bot trên Zalo
- [ ] Server log hiện webhook request
- [ ] Test sendMessage API → Nhận tin nhắn

---

## Vấn đề thường gặp:

### ❌ Firewall block port 3002

**Triệu chứng:** Curl timeout, server không nhận request

**Giải pháp:**
```bash
sudo ufw allow 3002
# Hoặc
sudo firewall-cmd --add-port=3002/tcp --permanent
sudo firewall-cmd --reload
```

### ❌ Webhook URL sai protocol

**Vấn đề:** Zalo yêu cầu HTTPS cho production

**Giải pháp tạm:** Dùng ngrok
```bash
npm install -g ngrok
ngrok http 3002

# Copy HTTPS URL từ ngrok (vd: https://abc123.ngrok.io)
# Set webhook = https://abc123.ngrok.io/webhook
```

### ❌ Secret token không khớp

**Kiểm tra:**
```bash
cat /var/www/tientienlorist/zalo-bot-tracker/.env | grep WEBHOOK_SECRET
```

Phải khớp với secret token trên web: `tientienflorist-secret-2026`

---

## Báo kết quả:

Chạy từng bước và cho mình biết:

1. ✅/❌ Firewall đã mở port chưa?
2. ✅/❌ Curl health endpoint từ máy local có OK không?
3. ✅/❌ Nhắn tin cho bot, server có log không?
