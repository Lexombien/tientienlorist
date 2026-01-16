@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:: ==============================================================================
:: TIENTIEN FLORIST - AUTO DEPLOY TO OPENLITESPEED (OLS)
:: ==============================================================================

cls
echo.
echo  =======================================================
echo  🚀 TOOL TRIỂN KHAI LÊN OPENLITESPEED (OLS)
echo  =======================================================
echo.

:: 1. KIỂM TRA MÔI TRƯỜNG
echo  [1/6] 🔍 Kiểm tra môi trường...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  ❌ Không tìm thấy Node.js! Vui lòng cài đặt Node.js.
    pause
    exit /b
)
where scp >nul 2>nul
if %errorlevel% neq 0 (
    echo  ❌ Không tìm thấy lệnh SCP! Hãy cài đặt OpenSSH Client (Windows 10/11 có sẵn).
    pause
    exit /b
)
where ssh >nul 2>nul
if %errorlevel% neq 0 (
    echo  ❌ Không tìm thấy lệnh SSH! Hãy cài đặt OpenSSH Client.
    pause
    exit /b
)
echo  ✅ Môi trường OK.
echo.

:: 2. NHẬP THÔNG TIN VPS
echo  [2/6] 📡 Cấu hình kết nối VPS (Nhấn Enter nếu muốn dùng giá trị mặc định)...
echo.
set /p VPS_IP="   👉 Nhập IP VPS (VD: 123.45.67.89): "
if "%VPS_IP%"=="" (
    echo  ❌ Bạn chưa nhập IP! Hủy bỏ.
    pause
    exit /b
)

set VPS_USER=root
set /p VPS_USER_INPUT="   👉 Nhập Username (Mặc định: root): "
if not "%VPS_USER_INPUT%"=="" set VPS_USER=%VPS_USER_INPUT%

set TARGET_DIR=/var/www/tientienflorist
set /p TARGET_DIR_INPUT="   👉 Nhập Folder đích trên VPS (Mặc định: /var/www/tientienflorist): "
if not "%TARGET_DIR_INPUT%"=="" set TARGET_DIR=%TARGET_DIR_INPUT%

echo.
echo  ⚠️  LƯU Ý: Tool sẽ yêu cầu mật khẩu VPS 2-3 lần (cho SSH/SCP).
echo.

:: 3. BUILD PROJECT
echo  [3/6] 🔨 Đang Build Project (Frontend)...
echo.
call npm run build
if %errorlevel% neq 0 (
    echo  ❌ Build thất bại!
    pause
    exit /b
)
echo  ✅ Build thành công!
echo.

:: 4. CHUẨN BỊ FILE DEPLOY
echo  [4/6] 📦 Đóng gói file...
if not exist "dist" (
    echo  ❌ Không tìm thấy folder dist!
    pause
    exit /b
)

:: Tạo file script deploy tạm thời trên VPS
echo  📝 Đang tạo script setup trên VPS...
(
echo #!/bin/bash
echo echo "🚀 Bắt đầu cài đặt trên VPS..."
echo.
echo # 1. Tạo thư mục nếu chưa có
echo mkdir -p %TARGET_DIR%
echo cd %TARGET_DIR%
echo.
echo # 2. Cài đặt dependencies
echo if [ ! -d "node_modules" ]; then
echo     echo "📦 Đang cài node modules..."
echo     npm install --production
echo else
echo     echo "📦 Cập nhật node modules..."
echo     npm install --production
echo fi
echo.
echo # 3. Restart PM2
echo if command -v pm2 ^&^> /dev/null; then
echo     echo "🔄 Restarting Backend Service..."
echo     pm2 restart tientienlorist --update-env ^|^| pm2 start server.js --name "tientienlorist"
echo     pm2 save
echo else
echo     echo "⚠️ PM2 chưa được cài đặt! Hãy cài: npm install -g pm2"
echo     node server.js ^&
echo fi
echo.
echo echo "✅ HOÀN TẤT TRIỂN KHAI!"
) > deploy-temp-script.sh

:: 5. UPLOAD FILE
echo  [5/6] 📤 Đang upload file lên VPS...
echo.
echo  --- Uploading: dist, server.js, package.json, uploads folder ---
echo.
:: Upload tuần tự
echo  👉 Uploading Frontend (dist)...
scp -r dist %VPS_USER%@%VPS_IP%:%TARGET_DIR%/
if %errorlevel% neq 0 goto UploadError

echo  👉 Uploading Backend (server.js)...
scp server.js %VPS_USER%@%VPS_IP%:%TARGET_DIR%/
if %errorlevel% neq 0 goto UploadError

echo  👉 Uploading Config (package.json)...
scp package.json %VPS_USER%@%VPS_IP%:%TARGET_DIR%/
if %errorlevel% neq 0 goto UploadError

echo  👉 Uploading Deploy Script...
scp deploy-temp-script.sh %VPS_USER%@%VPS_IP%:%TARGET_DIR%/install.sh
if %errorlevel% neq 0 goto UploadError

:: Xóa script tạm local
del deploy-temp-script.sh

echo  ✅ Upload hoàn tất!
echo.

:: 6. CHẠY LỆNH TRÊN VPS
echo  [6/6] 🔌 Kết nối SSH để cài đặt...
echo.
ssh %VPS_USER%@%VPS_IP% "cd %TARGET_DIR% && chmod +x install.sh && ./install.sh && rm install.sh"

echo.
echo  =======================================================
echo  🎉 TRIỂN KHAI THÀNH CÔNG!
echo  =======================================================
echo.
echo  💡 HƯỚNG DẪN TIẾP THEO (Chỉ làm lần đầu):
echo  1. Mở admin OLS: https://%VPS_IP%:7080
echo  2. Trỏ Virtual Host Root vào: %TARGET_DIR%/dist
echo  3. Tạo Context /api/ trỏ về: http://127.0.0.1:3001/api/
echo  4. Xem chi tiết tại file: DEPLOY_OLS.md
echo.
pause
exit /b

:UploadError
echo.
echo  ❌ LỖI UPLOAD! Kiểm tra lại IP, Mật khẩu hoặc Mạng.
del deploy-temp-script.sh
pause
exit /b
