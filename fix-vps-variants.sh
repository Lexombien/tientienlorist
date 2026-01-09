#!/bin/bash

# 🔧 SCRIPT FIX VARIANTS TRÊN VPS
# Chạy trên VPS để fix variant badge không hiển thị

echo "🚀 Bắt đầu fix variant features..."

# 1. Stop PM2 để rebuild an toàn
echo "⏸️  Dừng backend..."
pm2 stop tientienlorist

# 2. Pull code mới nhất
echo "📥 Pull code mới từ GitHub..."
git pull origin main

# 3. Cài đặt dependencies (đảm bảo có axios)
echo "📦 Cài đặt dependencies..."
npm install

# 4. XÓA dist cũ hoàn toàn
echo "🗑️  Xóa build cũ..."
rm -rf dist
rm -rf node_modules/.vite

# 5. Build lại HOÀN TOÀN
echo "🏗️  Build production (có thể mất 1-2 phút)..."
npm run build

# 6. Verify build có variant code
echo "🔍 Kiểm tra build có variant code..."
if grep -r "variantId" dist/assets/*.js > /dev/null 2>&1; then
    echo "✅ Build có chứa variant code"
else
    echo "⚠️  WARNING: Build KHÔNG có variant code!"
    echo "   Có thể cần check lại TypeScript compilation"
fi

# 7. Clear Nginx cache
echo "🧹 Clear Nginx cache..."
if [ -d "/var/cache/nginx" ]; then
    sudo rm -rf /var/cache/nginx/*
fi

# 8. Xóa database.json cũ (nếu có demo data)
echo "🗑️  Kiểm tra database.json..."
if grep -q "picsum" database.json 2>/dev/null; then
    echo "⚠️  Phát hiện demo data trong database.json!"
    echo "🔄 Tạo database.json sạch..."
    cat > database.json <<'EOF'
{
  "products": [],
  "categories": [],
  "settings": {},
  "categorySettings": {},
  "media": {},
  "zaloNumber": ""
}
EOF
    chmod 666 database.json
    echo "✅ Database đã được reset"
else
    echo "✅ Database OK (không có demo data)"
fi

# 9. Restart PM2
echo "🔄 Restart backend..."
pm2 restart tientienlorist

# 10. Wait for backend to start
echo "⏳ Đợi backend khởi động..."
sleep 3

# 11. Verify backend running
if pm2 list | grep "online" > /dev/null; then
    echo "✅ Backend đang chạy"
else
    echo "❌ Backend CHƯA chạy! Check logs:"
    pm2 logs tientienlorist --lines 20
fi

# 12. Reload Nginx (không cache)
echo "🔄 Reload Nginx..."
sudo nginx -t && sudo systemctl reload nginx

# 13. FORCE CLEAR client-side cache
echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║  ✅ SERVER ĐÃ ĐƯỢC CẬP NHẬT!                         ║"
echo "║                                                       ║"
echo "║  📱 QUAN TRỌNG - TRÊN BROWSER:                       ║"
echo "║                                                       ║"
echo "║  1. Nhấn Ctrl + Shift + Delete                       ║"
echo "║  2. Xóa: Cached images and files                     ║"
echo "║  3. Xóa: Cookies and site data                       ║"
echo "║  4. Hard refresh: Ctrl + Shift + R                   ║"
echo "║                                                       ║"
echo "║  Hoặc mở Incognito/Private mode để test!             ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# 14. Test variant endpoint
echo "🧪 Testing variant code..."
if curl -s http://localhost:3001/api/health | grep "OK" > /dev/null; then
    echo "✅ Backend API responding"
    
    # Test if dist has the new code
    ASSET_FILE=$(ls -1 dist/assets/index-*.js 2>/dev/null | head -1)
    if [ -n "$ASSET_FILE" ]; then
        if grep -q "variantId" "$ASSET_FILE"; then
            echo "✅ Frontend code có variant support"
        else
            echo "⚠️  Frontend code CHƯA có variant!"
        fi
    fi
else
    echo "⚠️  Backend API not responding"
fi

echo ""
echo "🎉 Script hoàn tất!"
echo "💡 Nếu vẫn không hiện variant:"
echo "   1. Clear browser cache (Ctrl+Shift+Delete)"
echo "   2. Hard reload (Ctrl+Shift+R)"  
echo "   3. Hoặc dùng Incognito mode"
