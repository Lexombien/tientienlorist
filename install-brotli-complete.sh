#!/bin/bash

# Script: Cài Brotli cho Nginx - IDEMPOTENT (chạy nhiều lần OK)
# Usage: sudo bash install-brotli-complete.sh

set -e

echo "🚀 Bắt đầu cài đặt Brotli cho Nginx..."

# 1. Cài dependencies
echo "📦 Cài dependencies..."
apt update
export DEBIAN_FRONTEND=noninteractive
apt install -y git build-essential cmake libpcre3-dev zlib1g-dev libssl-dev

# 2. Lấy Nginx version
NGINX_VERSION=$(nginx -v 2>&1 | grep -oP '(?<=nginx/)[0-9.]+')
echo "✅ Nginx version: $NGINX_VERSION"

# 3. Clone Brotli module
echo "📥 Clone Brotli module..."
cd /usr/local/src
if [ -d "ngx_brotli" ]; then
    rm -rf ngx_brotli
fi
git clone --recursive https://github.com/google/ngx_brotli.git

# 4. Build Brotli libraries
echo "🔨 Build Brotli libraries..."
cd ngx_brotli/deps/brotli
mkdir -p out && cd out
cmake ..
make
make install
ldconfig

# 5. Download Nginx source
echo "📥 Download Nginx source..."
cd /usr/local/src
if [ ! -f "nginx-${NGINX_VERSION}.tar.gz" ]; then
    wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz
fi
tar -xzf nginx-${NGINX_VERSION}.tar.gz

# 6. Build Brotli module
echo "🔨 Build Nginx Brotli module..."
cd nginx-${NGINX_VERSION}
./configure --with-compat --add-dynamic-module=../ngx_brotli
make modules

# 7. Copy modules
echo "📋 Install modules..."
mkdir -p /usr/lib/nginx/modules
cp objs/ngx_http_brotli_filter_module.so /usr/lib/nginx/modules/
cp objs/ngx_http_brotli_static_module.so /usr/lib/nginx/modules/

# 8. Backup nginx.conf
echo "💾 Backup nginx.conf..."
BACKUP_FILE="/etc/nginx/nginx.conf.backup-$(date +%Y%m%d-%H%M%S)"
cp /etc/nginx/nginx.conf "$BACKUP_FILE"
echo "  ✓ Backup: $BACKUP_FILE"

# 9. Configure nginx.conf - CHECK TỪNG DIRECTIVE
echo "⚙️ Configure nginx.conf..."

# Check load_module filter
if ! grep -q "load_module.*ngx_http_brotli_filter_module" /etc/nginx/nginx.conf; then
    echo "  ➕ Adding Brotli filter module..."
    sed -i '1i load_module modules/ngx_http_brotli_filter_module.so;' /etc/nginx/nginx.conf
else
    echo "  ✓ Brotli filter module already loaded"
fi

# Check load_module static
if ! grep -q "load_module.*ngx_http_brotli_static_module" /etc/nginx/nginx.conf; then
    echo "  ➕ Adding Brotli static module..."
    sed -i '1i load_module modules/ngx_http_brotli_static_module.so;' /etc/nginx/nginx.conf
else
    echo "  ✓ Brotli static module already loaded"
fi

# Check http block có Brotli config chưa
HTTP_BLOCK_HAS_BROTLI=false
if grep -q "brotli on;" /etc/nginx/nginx.conf; then
    HTTP_BLOCK_HAS_BROTLI=true
fi

if [ "$HTTP_BLOCK_HAS_BROTLI" = false ]; then
    echo "  ➕ Adding Brotli configuration to http block..."
    
    # Tạo temp file để an toàn hơn
    TEMP_CONF=$(mktemp)
    
    # Add Brotli config SAU dòng "http {"
    awk '/^http \{/ {
        print
        print "    # Brotli compression"
        print "    brotli on;"
        print "    brotli_comp_level 6;"
        print "    brotli_static on;"
        print "    brotli_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;"
        print ""
        next
    }
    {print}' /etc/nginx/nginx.conf > "$TEMP_CONF"
    
    # Copy temp file back
    mv "$TEMP_CONF" /etc/nginx/nginx.conf
    
    echo "  ✓ Brotli config added"
else
    echo "  ✓ Brotli already configured in http block"
fi

# 10. Test config
echo "✅ Test Nginx config..."
if nginx -t 2>&1; then
    echo "  ✓ Config test PASSED"
else
    echo "  ❌ Config test FAILED"
    echo "  💾 Restoring backup..."
    cp "$BACKUP_FILE" /etc/nginx/nginx.conf
    echo "  🔙 Backup restored. Check errors above."
    exit 1
fi

# 11. Reload Nginx
echo "🔄 Reload Nginx..."
systemctl reload nginx

# 12. Verify
echo ""
echo "🎉 CÀI ĐẶT HOÀN TẤT!"
echo ""
echo "✅ Brotli module: Installed"
echo "✅ Nginx config: Updated"
echo "✅ Nginx: Reloaded"
echo ""
echo "📊 Verify module:"
echo "   nginx -V 2>&1 | grep brotli"
echo ""
echo "🧪 Test compression:"
echo "   curl -I -H 'Accept-Encoding: br' https://YOUR_DOMAIN"
echo "   # Should see: Content-Encoding: br"
echo ""
echo "📝 Config: /etc/nginx/nginx.conf"
echo "📝 Backup: $BACKUP_FILE"
echo ""
echo "💡 Script is IDEMPOTENT - safe to run multiple times!"
echo ""
