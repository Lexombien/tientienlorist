#!/bin/bash

# Script: Cài Brotli module cho Nginx
# Author: Auto-generated
# Usage: sudo bash install-brotli.sh

set -e

echo "🔧 Cài đặt Brotli module cho Nginx..."

# 1. Cài dependencies
echo "📦 Cài dependencies..."
apt update
apt install -y git build-essential libpcre3-dev zlib1g-dev libssl-dev

# 2. Lấy Nginx version hiện tại
NGINX_VERSION=$(nginx -v 2>&1 | grep -oP '(?<=nginx/)[0-9.]+')
echo "✅ Nginx version: $NGINX_VERSION"

# 3. Download Brotli module
echo "📥 Download Brotli module..."
cd /usr/local/src
if [ -d "ngx_brotli" ]; then
    rm -rf ngx_brotli
fi
git clone --recursive https://github.com/google/ngx_brotli.git
cd ngx_brotli
git submodule update --init --recursive

# 4. Download Nginx source code
echo "📥 Download Nginx source..."
cd /usr/local/src
if [ ! -f "nginx-${NGINX_VERSION}.tar.gz" ]; then
    wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz
fi
tar -xzf nginx-${NGINX_VERSION}.tar.gz
cd nginx-${NGINX_VERSION}

# 5. Get existing Nginx compile flags
echo "🔍 Lấy compile flags hiện tại..."
NGINX_ARGS=$(nginx -V 2>&1 | grep 'configure arguments:' | sed 's/configure arguments://')

# 6. Compile Brotli as dynamic module
echo "🔨 Compile Brotli module..."
./configure $NGINX_ARGS --add-dynamic-module=/usr/local/src/ngx_brotli
make modules

# 7. Copy modules to Nginx
echo "📋 Copy modules..."
mkdir -p /usr/share/nginx/modules
cp objs/ngx_http_brotli_filter_module.so /usr/share/nginx/modules/
cp objs/ngx_http_brotli_static_module.so /usr/share/nginx/modules/

# 8. Load modules in nginx.conf
echo "⚙️ Config Nginx..."
if ! grep -q "ngx_http_brotli" /etc/nginx/nginx.conf; then
    # Backup
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
    
    # Add load_module at the top
    sed -i '1i load_module modules/ngx_http_brotli_filter_module.so;\nload_module modules/ngx_http_brotli_static_module.so;\n' /etc/nginx/nginx.conf
fi

# 9. Add Brotli config
if ! grep -q "brotli on;" /etc/nginx/nginx.conf; then
    # Find http block and add brotli config
    sed -i '/http {/a \
    # Brotli compression\n\
    brotli on;\n\
    brotli_comp_level 6;\n\
    brotli_static on;\n\
    brotli_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;\n' /etc/nginx/nginx.conf
fi

# 10. Test config
echo "✅ Test Nginx config..."
nginx -t

# 11. Reload Nginx
echo "🔄 Reload Nginx..."
systemctl reload nginx

echo ""
echo "🎉 HOÀN THÀNH!"
echo ""
echo "✅ Brotli module đã được cài đặt và kích hoạt"
echo "✅ Nginx đã được reload"
echo ""
echo "📊 Test Brotli:"
echo "   nginx -V 2>&1 | grep brotli"
echo ""
echo "🔍 Test compression:"
echo "   curl -I -H 'Accept-Encoding: br' https://YOUR_DOMAIN"
echo ""
