# 🔧 Hướng Dẫn Khắc Phục Lỗi Trang Trắng (Blank Page)

## Vấn đề
Khi truy cập website lần đầu thì hoạt động bình thường, nhưng từ lần thứ 2 trở đi, trang hiển thị trắng và có lỗi trong console:
```
Uncaught TypeError: Cannot read properties of undefined (reading 'replace')
```

## Nguyên nhân
Lỗi này xảy ra do dữ liệu trong `localStorage` của trình duyệt bị corrupted hoặc thiếu trường dữ liệu khi nâng cấp code.

## Giải pháp đã áp dụng

### 1. **Thêm Error Handling cho localStorage** ✅
- Tất cả các lần đọc `localStorage` đều được wrap trong `try-catch`
- Nếu dữ liệu bị lỗi (corrupted), tự động xóa và dùng giá trị mặc định
- Merge data từ `localStorage` với default values để đảm bảo không thiếu trường

### 2. **Safe Fallback cho customValue** ✅
- Thêm fallback `|| '3/4'` cho `globalSettings.customValue`
- Tránh lỗi khi `customValue` là `undefined` hoặc `null`

### 3. **Auto-recovery** ✅
- Khi phát hiện lỗi parsing, tự động:
  - Xóa dữ liệu corrupted
  - Khôi phục về giá trị mặc định
  - Ghi log để debug

## Cách khắc phục nhanh cho user hiện tại

Nếu vẫn gặp lỗi trang trắng sau khi deploy code mới, hãy làm theo các bước sau:

### Cách 1: Clear localStorage (Khuyến nghị)
Mở Console trong trình duyệt (F12) và chạy lệnh:
```javascript
// Xóa tất cả dữ liệu cũ
localStorage.clear();
sessionStorage.clear();

// Reload trang
location.reload();
```

### Cách 2: Clear Cache của trình duyệt
1. Nhấn **Ctrl + Shift + Delete** (Windows) hoặc **Cmd + Shift + Delete** (Mac)
2. Chọn "Cached images and files" và "Cookies and site data"
3. Chọn "All time"
4. Nhấn "Clear data"
5. Reload trang

### Cách 3: Hard Reload
Nhấn **Ctrl + Shift + R** (Windows) hoặc **Cmd + Shift + R** (Mac)

## Kiểm tra sau khi fix

1. ✅ Truy cập trang lần đầu → Phải load được
2. ✅ Reload trang (F5) → Phải vẫn hoạt động bình thường
3. ✅ Đóng tab và mở lại → Phải vẫn hoạt động
4. ✅ Không có lỗi trong Console

## Deploy lên VPS

Sau khi code đã được commit và push, chạy lệnh deploy:

```bash
# SSH vào VPS
ssh user@your-vps-ip

# Vào thư mục project
cd /path/to/project

# Pull code mới
git pull origin main

# Rebuild frontend
npm run build

# Restart server (nếu cần)
pm2 restart all
```

## Lưu ý

- ⚠️ Code mới đã tự động xử lý lỗi này, user mới sẽ không gặp vấn đề
- ⚠️ User cũ có thể cần clear localStorage một lần duy nhất
- ✅ Sau khi clear, mọi thứ sẽ hoạt động bình thường

## Liên hệ

Nếu vẫn gặp vấn đề, vui lòng:
1. Chụp ảnh màn hình lỗi trong Console (F12)
2. Gửi kèm thông tin trình duyệt đang dùng
3. Gửi kèm URL trang bị lỗi
