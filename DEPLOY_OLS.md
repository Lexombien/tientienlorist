# HƯỚNG DẪN TRIỂN KHAI LÊN OPENLITESPEED (OLS)

Tài liệu này hướng dẫn cách triển khai dự án **Tientien Florist** lên VPS chạy **OpenLiteSpeed** (thường đi kèm CyberPanel hoặc OLS image).

---

## BƯỚC 1: CHUẨN BỊ VPS

Đảm bảo VPS của bạn đã cài đặt các thành phần sau. Nếu dùng image CyberPanel của các nhà cung cấp VPS thì thường đã có sẵn OLS.

Bạn cần cài thêm **Node.js** và **PM2** trên VPS:

1. **SSH vào VPS**:
   ```bash
   ssh root@your-vps-ip
   ```

2. **Cài Node.js 22 LTS (nếu chưa có):**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
   apt-get install -y nodejs
   ```

3. **Cài đặt PM2 (để chạy backend):**
   ```bash
   npm install -g pm2
   pm2 startup
   ```

---

## BƯỚC 2: TRIỂN KHAI CODE (AUTO)

Sử dụng script `deploy-ols.cmd` trên máy tính Windows của bạn để tự động build và upload code lên VPS.

1. Chạy file `deploy-ols.cmd`.
2. Nhập **IP VPS**, **User** (root) và **Folder đích** (nên để mặc định `/var/www/tientienflorist`).
3. Đợi script chạy xong (Build -> Upload -> Install).

Sau khi chạy xong, code đã nằm trên VPS, và Frontend đã được build ra thư mục `dist`.

---

## BƯỚC 3: CẤU HÌNH OPENLITESPEED (WEB ADMIN)

Truy cập WebAdmin của OpenLiteSpeed: `https://<IP-VPS>:7080` (Tài khoản thường là `admin`, mật khẩu lấy bằng lệnh `cat /usr/local/lsws/adminpasswd` hoặc reset bằng `/usr/local/lsws/admin/misc/admpass.sh`).

### 1. Tạo Virtual Host (VHost)
- Vào **Virtual Hosts** -> Bấm dấu `+` để thêm mới.
- **Virtual Host Name**: `tientienflorist`
- **Virtual Host Root**: `/var/www/tientienflorist` (Folder bạn đã upload ở Bước 2)
- **Config File**: `$SERVER_ROOT/conf/vhosts/$VH_NAME/vhconf.conf`
- **Enable Scripts/Restricted**: Yes
- Lưu lại và tạo file config nếu được hỏi.

### 2. Cấu hình General
- Vào VHost `tientienflorist` vừa tạo -> **General**.
- **Document Root**: `$VH_ROOT/dist` (Trỏ vào folder dist của React).
- **Index Files**: `index.html`.

### 3. Cấu hình Rewrite (Để React Router hoạt động)
- Vào tab **Rewrite**.
- **Enable Rewrite**: Yes
- **Auto Load from .htaccess**: Yes
- **Rewrite Rules**:
  ```apache
  RewriteEngine On
  # Nếu file/folder không tồn tại, trỏ về index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
  ```

### 4. Cấu hình Reverse Proxy (Cho API & Uploads)
Để Frontend gọi được Backend (`/api`), ta cần cấu hình Proxy.

- Vào tab **Context** -> Bấm dấu `+`.
- Chọn loại: **Proxy**.
- **URI**: `/api/`
- **Web Server**: Chọn Web Server (thường phải tạo External App trước, xem bên dưới).

**💡 Cách tạo External App (Web Server) cho Node.js:**
1. Ra ngoài menu chính **Server Configuration** -> **External App**.
2. Thêm mới -> Loại **Web Server**.
3. **Name**: `node-backend`
4. **Address**: `http://127.0.0.1:3001`
5. Lưu lại.

**Quay lại VHost Context:**
- **URI**: `/api/`
- **Web Server**: Chọn `[Server] node-backend`.
- Lưu lại.

**Tương tự cho `/uploads/` (để xem ảnh):**
- **Option 1 (Nhanh nhất):** Map trực tiếp folder uploads.
  - Tạo Context mới -> Loại **Static**.
  - **URI**: `/uploads/`
  - **Location**: `/var/www/tientienflorist/uploads/`
  - **Accessible**: Yes.
- **Option 2 (Qua Node.js):**
  - Tạo Context mới -> Loại **Proxy**.
  - **URI**: `/uploads/`
  - **Web Server**: `[Server] node-backend`.

### 5. Listeners (Mở cổng 80/443)
- Vào **Listeners**.
- Thêm Listener cho Port 80 (HTTP) và map với VHost `tientienflorist`.
- Thêm Listener cho Port 443 (HTTPS) nếu có SSL.

### 6. Khởi động lại OLS
- Bấm nút **Graceful Restart** (màu xanh lá) ở góc trên bên phải.

---

## BƯỚC 4: CẤU HÌNH BIẾN MÔI TRƯỜNG (.ENV)

Mặc định script deploy chưa copy file `.env` lên để bảo mật. Bạn cần tạo thủ công trên VPS:

1. SSH vào VPS:
   ```bash
   ssh root@<IP-VPS>
   ```
2. Vào thư mục:
   ```bash
   cd /var/www/tientienflorist
   ```
3. Tạo file `.env`:
   ```bash
   nano .env
   ```
4. Copy nội dung từ file `.env` ở máy local của bạn và paste vào.
5. Lưu lại (`Ctrl+O` -> Enter -> `Ctrl+X`).
6. Restart Backend:
   ```bash
   pm2 restart tientienlorist --update-env
   ```

---

## CHÚC MỪNG!
Web của bạn đã chạy trên OpenLiteSpeed.
- Frontend: `http://<IP-VPS>` hoặc domain của bạn.
- API: `http://<IP-VPS>/api/ping`
