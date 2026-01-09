#!/bin/bash

#############################################################################
# 🚀 AUTO DEPLOY SCRIPT - TIENTIEN FLORIST
# Tự động hóa toàn bộ quá trình deploy lên VPS Ubuntu
# 
# Chạy sau khi: git clone https://github.com/Lexombien/tientienlorist.git
# Usage: sudo bash auto-deploy.sh
#############################################################################

# Colors for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Emojis
CHECK="✅"
CROSS="❌"
ROCKET="🚀"
GEAR="⚙️"
LOCK="🔒"
FIRE="🔥"
SPARKLES="✨"
PACKAGE="📦"
GLOBE="🌐"

# Logging functions
log_info() {
    echo -e "${BLUE}${GEAR} $1${NC}"
}

log_success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
}

log_error() {
    echo -e "${RED}${CROSS} $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_step() {
    echo -e "\n${MAGENTA}${ROCKET} ===== $1 =====${NC}\n"
}

log_header() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║                                                       ║"
    echo "║     🌸 TIENTIEN FLORIST - AUTO DEPLOY SCRIPT 🌸      ║"
    echo "║                                                       ║"
    echo "║         Tự động deploy lên VPS Production!           ║"
    echo "║                                                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
}

# Check if running as root or sudo
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        log_error "Script này cần chạy với sudo!"
        log_info "Chạy lại: sudo bash auto-deploy.sh"
        exit 1
    fi
    log_success "Đang chạy với quyền sudo"
}

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
log_info "Working directory: $SCRIPT_DIR"

#############################################################################
# STEP 1: COLLECT USER INPUT
#############################################################################

collect_info() {
    log_step "BƯỚC 1: THU THẬP THÔNG TIN"
    
    # Domain name
    echo -e "${WHITE}Nhập tên miền của bạn (ví dụ: tientienlorist.com):${NC}"
    read -p "Domain: " DOMAIN
    while [ -z "$DOMAIN" ]; do
        log_error "Tên miền không được để trống!"
        read -p "Domain: " DOMAIN
    done
    log_success "Domain: $DOMAIN"
    
    # Add www subdomain?
    echo -e "\n${WHITE}Bạn có muốn thêm www.$DOMAIN không? (y/n):${NC}"
    read -p "Add www? " ADD_WWW
    if [[ "$ADD_WWW" =~ ^[Yy]$ ]]; then
        WWW_DOMAIN="www.$DOMAIN"
        log_success "Sẽ setup cả: $DOMAIN và $WWW_DOMAIN"
    else
        WWW_DOMAIN=""
        log_success "Chỉ setup: $DOMAIN"
    fi
    
    # Admin credentials
    echo -e "\n${WHITE}Nhập tên đăng nhập admin:${NC}"
    read -p "Admin username: " ADMIN_USER
    while [ -z "$ADMIN_USER" ]; do
        log_error "Username không được để trống!"
        read -p "Admin username: " ADMIN_USER
    done
    log_success "Admin username: $ADMIN_USER"
    
    echo -e "\n${WHITE}Nhập mật khẩu admin (tối thiểu 8 ký tự):${NC}"
    read -sp "Admin password: " ADMIN_PASS
    echo
    while [ ${#ADMIN_PASS} -lt 8 ]; do
        log_error "Mật khẩu phải có ít nhất 8 ký tự!"
        read -sp "Admin password: " ADMIN_PASS
        echo
    done
    log_success "Mật khẩu đã được thiết lập"
    
    # Confirm
    echo -e "\n${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${WHITE}Xác nhận thông tin:${NC}"
    echo -e "  Domain: ${GREEN}$DOMAIN${NC}"
    if [ -n "$WWW_DOMAIN" ]; then
        echo -e "  WWW Domain: ${GREEN}$WWW_DOMAIN${NC}"
    fi
    echo -e "  Admin User: ${GREEN}$ADMIN_USER${NC}"
    echo -e "  Admin Pass: ${GREEN}********${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}\n"
    
    read -p "Tiếp tục deploy? (y/n): " CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
        log_error "Deployment đã bị hủy!"
        exit 0
    fi
    
    log_success "Thông tin đã được xác nhận! Bắt đầu deploy..."
}

#############################################################################
# STEP 2: INSTALL NODE.JS 22 LTS
#############################################################################

install_nodejs() {
    log_step "BƯỚC 2: CÀI ĐẶT NODE.JS 22 LTS"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_info "Node.js đã được cài: $NODE_VERSION"
        
        if [[ "$NODE_VERSION" =~ ^v22 ]]; then
            log_success "Node.js 22.x đã có sẵn, bỏ qua cài đặt"
            return
        else
            log_warning "Phiên bản Node.js hiện tại không phải 22.x, sẽ upgrade..."
        fi
    fi
    
    log_info "Đang thêm NodeSource repository..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    
    log_info "Đang cài đặt Node.js..."
    apt-get install -y nodejs
    
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    log_success "Node.js $NODE_VERSION đã được cài đặt"
    log_success "npm $NPM_VERSION đã được cài đặt"
}

#############################################################################
# STEP 3: INSTALL NGINX
#############################################################################

install_nginx() {
    log_step "BƯỚC 3: CÀI ĐẶT NGINX"
    
    if command -v nginx &> /dev/null; then
        log_success "Nginx đã được cài đặt"
    else
        log_info "Đang cài đặt Nginx..."
        apt-get install -y nginx
        log_success "Nginx đã được cài đặt"
    fi
    
    systemctl start nginx
    systemctl enable nginx
    log_success "Nginx đã được start và enable"
}

#############################################################################
# STEP 4: INSTALL PM2
#############################################################################

install_pm2() {
    log_step "BƯỚC 4: CÀI ĐẶT PM2"
    
    if command -v pm2 &> /dev/null; then
        log_success "PM2 đã được cài đặt"
    else
        log_info "Đang cài đặt PM2 globally..."
        npm install -g pm2
        log_success "PM2 đã được cài đặt"
    fi
    
    # Setup PM2 startup
    log_info "Setup PM2 startup..."
    pm2 startup systemd -u root --hp /root | grep "sudo" | bash
    log_success "PM2 startup đã được cấu hình"
}

#############################################################################
# STEP 5: INSTALL DEPENDENCIES
#############################################################################

install_dependencies() {
    log_step "BƯỚC 5: CÀI ĐẶT NPM DEPENDENCIES"
    
    cd "$SCRIPT_DIR"
    
    log_info "Đang chạy npm install..."
    log_warning "Quá trình này có thể mất 2-5 phút..."
    
    npm install --production=false 2>&1 | while read line; do
        echo "  $line"
    done
    
    if [ $? -eq 0 ]; then
        log_success "Dependencies đã được cài đặt thành công"
    else
        log_error "Lỗi khi cài đặt dependencies!"
        exit 1
    fi
}

#############################################################################
# STEP 6: CREATE .ENV FILE
#############################################################################

create_env() {
    log_step "BƯỚC 6: TẠO FILE .ENV"
    
    cd "$SCRIPT_DIR"
    
    log_info "Đang tạo file .env..."
    
    cat > .env << EOF
# Production Environment
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Admin Credentials
ADMIN_USERNAME=$ADMIN_USER
ADMIN_PASSWORD=$ADMIN_PASS

# Domain
DOMAIN=$DOMAIN

# ZALO BOT TRACKING
BOT_TOKEN=3090079708889577948:WumpeIcImCEOqynlXvuncOOsbxxdOpCyxBpNihQFoTtOzqTGXKSWKIkevToDoMVL
OWNER_ZALO_IDS=temp
# Để thêm nhiều người: OWNER_ZALO_IDS=id1,id2,id3
WEBHOOK_SECRET=tientienflorist-secret-2026
SHOP_NAME=Tientienflorist
EOF

    chmod 600 .env
    log_success "File .env đã được tạo với Zalo Bot config"
    log_info "Permissions: 600 (chỉ root có thể đọc)"
}

#############################################################################
# STEP 7: BUILD PRODUCTION
#############################################################################

build_production() {
    log_step "BƯỚC 7: BUILD PRODUCTION"
    
    cd "$SCRIPT_DIR"
    
    log_info "Đang chạy npm run build..."
    log_warning "Quá trình này có thể mất 1-3 phút..."
    
    npm run build 2>&1 | while read line; do
        echo "  $line"
    done
    
    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        log_success "Build thành công! Kích thước: $DIST_SIZE"
    else
        log_error "Build thất bại! Folder dist không tồn tại"
        exit 1
    fi
}

#############################################################################
# STEP 8: START BACKEND WITH PM2
#############################################################################

start_backend() {
    log_step "BƯỚC 8: KHỞI ĐỘNG BACKEND VỚI PM2"
    
    cd "$SCRIPT_DIR"
    
    # Test server.js syntax first
    log_info "Testing server.js syntax..."
    if node --check server.js 2>/dev/null; then
        log_success "✅ server.js syntax OK"
    else
        log_error "❌ server.js có lỗi syntax!"
        node --check server.js
        log_warning "Fix lỗi và chạy lại script"
        exit 1
    fi
    
    # Check .env exists
    if [ ! -f ".env" ]; then
        log_error "❌ File .env không tồn tại!"
        log_info "Tạo .env từ template..."
        
        cat > .env <<EOF
# Production Environment
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Admin Credentials
ADMIN_USERNAME=$ADMIN_USER
ADMIN_PASSWORD=$ADMIN_PASS

# Domain
DOMAIN=$DOMAIN

# ZALO BOT TRACKING
BOT_TOKEN=3090079708889577948:WumpeIcImCEOqynlXvuncOOsbxxdOpCyxBpNihQFoTtOzqTGXKSWKIkevToDoMVL
OWNER_ZALO_IDS=temp
# Để thêm nhiều người: OWNER_ZALO_IDS=id1,id2,id3
WEBHOOK_SECRET=tientienflorist-secret-2026
SHOP_NAME=Tientienflorist
EOF
        chmod 600 .env
        log_success "✅ Đã tạo .env với Zalo Bot config"
    fi
    
    # Test server can start (quick test)
    log_info "Testing server startup (5 seconds)..."
    timeout 5 node server.js &
    TEST_PID=$!
    sleep 3
    
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        log_success "✅ Server test OK"
        kill $TEST_PID 2>/dev/null
    else
        log_warning "⚠️  Server test failed, nhưng vẫn tiếp tục với PM2..."
        kill $TEST_PID 2>/dev/null
    fi
    
    # Stop existing process if any
    if pm2 list | grep -q "tientienlorist"; then
        log_info "Dừng process cũ..."
        pm2 delete tientienlorist
    fi
    
    log_info "Đang start server với PM2..."
    log_warning "Đang load .env file..."
    
    # Start PM2 với --update-env để force load .env
    pm2 start server.js --name "tientienlorist" --update-env 2>&1 | tee /tmp/pm2-start.log
    
    sleep 3
    
    if pm2 list | grep -q "online"; then
        log_success "Backend đã được start thành công với PM2"
        pm2 save
        log_success "PM2 config đã được lưu"
        
        # Verify env loaded
        log_info "Verifying .env loaded..."
        if pm2 show tientienlorist | grep -q "ADMIN_USERNAME"; then
            log_success "✅ .env đã được load thành công!"
        else
            log_warning "⚠️  .env có thể chưa load. Restart lại:"
            log_info "pm2 restart tientienlorist --update-env"
        fi
        
        # Test API endpoint
        sleep 2
        log_info "Testing API endpoint..."
        if curl -s http://localhost:3001/api/health | grep -q "OK" 2>/dev/null; then
            log_success "✅ API responding!"
        else
            log_warning "⚠️  API not responding yet (có thể cần thêm thời gian)"
        fi
    else
        log_error "❌ Lỗi khi start backend!"
        log_error ""
        log_error "📋 PM2 STATUS:"
        pm2 status
        log_error ""
        log_error "📋 PM2 LOGS (50 dòng cuối):"
        pm2 logs tientienlorist --lines 50 --nostream
        log_error ""
        log_error "📋 DEBUG COMMANDS:"
        log_info "1. Check logs: ${GREEN}pm2 logs tientienlorist${NC}"
        log_info "2. Test server: ${GREEN}node server.js${NC}"
        log_info "3. Check .env: ${GREEN}cat .env${NC}"
        log_info "4. Check port: ${GREEN}lsof -i :3001${NC}"
        log_info "5. Restart PM2: ${GREEN}pm2 restart tientienlorist --update-env${NC}"
        log_error ""
        
        # Don't exit, let user debug
        log_warning "⚠️  Backend có vấn đề nhưng deployment tiếp tục..."
        log_warning "Hãy fix lỗi bằng debug commands ở trên"
    fi
}

#############################################################################
# STEP 9: SETUP NGINX CONFIG
#############################################################################

setup_nginx() {
    log_step "BƯỚC 9: CẤU HÌNH NGINX"
    
    NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"
    
    log_info "Đang tạo Nginx config: $NGINX_CONFIG"
    
    # Build server_name directive
    if [ -n "$WWW_DOMAIN" ]; then
        SERVER_NAME="$DOMAIN $WWW_DOMAIN"
    else
        SERVER_NAME="$DOMAIN"
    fi
    
    cat > "$NGINX_CONFIG" << 'NGINXEOF'
server {
    listen 80;
    listen [::]:80;
    
    server_name SERVER_NAME_PLACEHOLDER;
    
    # Root folder - trỏ đến dist (frontend static files)
    root PROJECT_DIR_PLACEHOLDER/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # QUAN TRỌNG: Serve static uploads TRỰC TIẾP
    # Dùng ^~ để có priority cao nhất, tránh bị override bởi regex location
    # Root phải trở về parent directory vì uploads/ ở ngoài dist/
    location ^~ /uploads/ {
        root PROJECT_DIR_PLACEHOLDER;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        access_log off;
    }
    
    # API requests → Node.js backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers cho API
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        
        # Handle preflight
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
    
    # Frontend static files
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
NGINXEOF

    # Replace placeholders
    sed -i "s|SERVER_NAME_PLACEHOLDER|$SERVER_NAME|g" "$NGINX_CONFIG"
    sed -i "s|PROJECT_DIR_PLACEHOLDER|$SCRIPT_DIR|g" "$NGINX_CONFIG"
    
    # 🔥 CRITICAL: Verify uploads location has correct root path
    log_info "Validating uploads location config..."
    if grep -A 5 "location \^~ /uploads/" "$NGINX_CONFIG" | grep -q "root $SCRIPT_DIR/dist;"; then
        log_warning "Uploads location incorrectly pointing to dist/, fixing..."
        sed -i '/location \^~ \/uploads\/ {/,/}/ s|root .*/dist;|root '"$SCRIPT_DIR"';|' "$NGINX_CONFIG"
        log_success "Fixed uploads location root path"
    else
        log_success "Uploads location correctly configured"
    fi
    
    log_success "Nginx config đã được tạo"
    
    # Enable site
    log_info "Đang enable site..."
    ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/$DOMAIN"
    
    # Test config
    log_info "Đang test Nginx config..."
    if nginx -t 2>&1 | grep -q "successful"; then
        log_success "Nginx config hợp lệ"
    else
        log_error "Nginx config không hợp lệ!"
        nginx -t
        exit 1
    fi
    
    # Reload Nginx
    log_info "Đang reload Nginx..."
    systemctl reload nginx
    log_success "Nginx đã được reload"
}

#############################################################################
# STEP 10: SETUP SSL WITH CERTBOT
#############################################################################

setup_ssl() {
    log_step "BƯỚC 10: CÀI ĐẶT SSL/HTTPS VỚI LET'S ENCRYPT"
    
    # Install Certbot if needed
    if ! command -v certbot &> /dev/null; then
        log_info "Đang cài đặt Certbot..."
        apt-get install -y certbot python3-certbot-nginx
        log_success "Certbot đã được cài đặt"
    else
        log_success "Certbot đã có sẵn"
    fi
    
    log_info "Đang xin SSL certificate từ Let's Encrypt..."
    log_warning "Quá trình này cần domain đã trỏ về IP VPS này!"
    log_warning "Nếu domain chưa trỏ, certificate sẽ fail. Bạn có thể chạy lại sau."
    
    echo
    read -p "Domain $DOMAIN đã trỏ về VPS này chưa? (y/n): " DOMAIN_READY
    
    if [[ ! "$DOMAIN_READY" =~ ^[Yy]$ ]]; then
        log_warning "Bỏ qua setup SSL. Bạn có thể chạy sau:"
        log_info "sudo certbot --nginx -d $DOMAIN $([ -n \"$WWW_DOMAIN\" ] && echo \"-d $WWW_DOMAIN\")"
        return
    fi
    
    # Get email for certificate
    echo -e "\n${WHITE}Nhập email để nhận thông báo SSL (để trống để bỏ qua):${NC}"
    read -p "Email: " SSL_EMAIL
    
    # Build certbot command
    CERTBOT_CMD="certbot --nginx -d $DOMAIN"
    if [ -n "$WWW_DOMAIN" ]; then
        CERTBOT_CMD="$CERTBOT_CMD -d $WWW_DOMAIN"
    fi
    
    if [ -n "$SSL_EMAIL" ]; then
        CERTBOT_CMD="$CERTBOT_CMD --email $SSL_EMAIL --agree-tos --no-eff-email"
    else
        CERTBOT_CMD="$CERTBOT_CMD --register-unsafely-without-email --agree-tos"
    fi
    
    CERTBOT_CMD="$CERTBOT_CMD --redirect --non-interactive"
    
    log_info "Đang chạy: $CERTBOT_CMD"
    
    if eval $CERTBOT_CMD; then
        log_success "SSL certificate đã được cài đặt thành công!"
        log_success "Website của bạn giờ có HTTPS! 🔒"
    else
        log_warning "⚠️  Không thể cài đặt SSL certificate tự động"
        log_info "Deployment vẫn tiếp tục với HTTP (không HTTPS)..."
        log_info ""
        log_info "📌 Để cài SSL sau, chạy lệnh này:"
        echo -e "   ${GREEN}sudo certbot --nginx -d $DOMAIN$([ -n \"$WWW_DOMAIN\" ] && echo \" -d $WWW_DOMAIN\")${NC}"
        log_info ""
        log_info "💡 Kiểm tra trước khi chạy certbot:"
        log_info "   1. Domain đã trỏ về IP VPS chưa: ping $DOMAIN"
        log_info "   2. Port 80/443 đã mở: sudo ufw status"
        log_info "   3. Nginx đang chạy: sudo systemctl status nginx"
    fi
}

#############################################################################
# STEP 11: SETUP FIREWALL (UFW)
#############################################################################

setup_firewall() {
    log_step "BƯỚC 11: CẤU HÌNH FIREWALL (UFW)"
    
    if ! command -v ufw &> /dev/null; then
        log_info "Đang cài đặt UFW..."
        apt-get install -y ufw
    fi
    
    log_info "Đang cấu hình UFW rules..."
    
    # Allow SSH (important!)
    ufw allow ssh
    ufw allow 22/tcp
    log_success "Đã allow SSH (port 22)"
    
    # Allow HTTP & HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    log_success "Đã allow HTTP (80) và HTTPS (443)"
    
    # Enable UFW
    log_info "Đang enable UFW..."
    echo "y" | ufw enable
    
    log_success "UFW firewall đã được cấu hình và enable"
    
    ufw status
}

#############################################################################
# STEP 12: CREATE ANALYTICS & DATABASE FILES
#############################################################################

create_data_files() {
    log_step "BƯỚC 12: TẠO FILES DỮ LIỆU"
    
    cd "$SCRIPT_DIR"
    
    # Create analytics.json if not exists
    if [ ! -f "analytics.json" ]; then
        log_info "Đang tạo analytics.json..."
        echo '{
  "pageViews": [],
  "productClicks": [],
  "sessionStart": '$(date +%s)000'
}' > analytics.json
        chmod 666 analytics.json
        log_success "analytics.json đã được tạo"
    else
        log_success "analytics.json đã tồn tại"
    fi
    
    # 🔥 QUAN TRỌNG: Database.json handling
    if [ ! -f "database.json" ]; then
        log_warning "⚠️  database.json không tồn tại!"
        log_info "Đang tạo database.json rỗng..."
        echo '{
  "products": [],
  "categories": [],
  "settings": {},
  "categorySettings": {},
  "media": {},
  "zaloNumber": ""
}' > database.json
        chmod 666 database.json
        log_success "database.json đã được tạo (rỗng)"
        log_warning "⚠️  BẠN CẦN THÊM SẢN PHẨM QUA ADMIN PANEL!"
    else
        # File đã tồn tại - tạo backup
        log_success "database.json đã tồn tại"
        
        # Tạo backup folder
        mkdir -p database-backups 2>/dev/null
        
        # Backup với timestamp
        BACKUP_FILE="database-backups/database_$(date +%Y%m%d_%H%M%S).json"
        cp database.json "$BACKUP_FILE" 2>/dev/null
        
        if [ -f "$BACKUP_FILE" ]; then
            log_success "📦 Đã backup: $BACKUP_FILE"
        fi
        
        log_info "✅ GIỮ NGUYÊN database.json hiện tại (có data)"
    fi
    
    # Create uploads folder
    if [ ! -d "uploads" ]; then
        mkdir -p uploads
        chmod 755 uploads
        log_success "Folder uploads đã được tạo"
    else
        log_success "Folder uploads đã tồn tại"
    fi
}

#############################################################################
# FINAL: DISPLAY SUCCESS MESSAGE
#############################################################################

display_success() {
    log_step "🎉 DEPLOYMENT HOÀN TẤT! 🎉"
    
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║          ✨ WEBSITE ĐÃ ĐƯỢC DEPLOY THÀNH CÔNG! ✨         ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    # Check if SSL was successful
    if certbot certificates 2>/dev/null | grep -q "$DOMAIN"; then
        PROTOCOL="https"
        SSL_STATUS="${GREEN}${LOCK} HTTPS Enabled${NC}"
    else
        PROTOCOL="http"
        SSL_STATUS="${YELLOW}⚠️  HTTP only (chạy certbot để enable HTTPS)${NC}"
    fi
    
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${WHITE}📌 THÔNG TIN WEBSITE:${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "  ${GLOBE} Website: ${GREEN}$PROTOCOL://$DOMAIN${NC}"
    if [ -n "$WWW_DOMAIN" ]; then
        echo -e "  ${GLOBE} WWW:     ${GREEN}$PROTOCOL://$WWW_DOMAIN${NC}"
    fi
    echo -e "  ${LOCK} SSL:     $SSL_STATUS"
    echo -e "  🔐 Admin:   ${GREEN}$PROTOCOL://$DOMAIN/#admin${NC}"
    echo -e "  📊 Analytics: ${GREEN}Admin → Tab 'Bảng Tổng Quan'${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}\n"
    
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${WHITE}🔑 THÔNG TIN ĐĂNG NHẬP:${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "  Username: ${GREEN}$ADMIN_USER${NC}"
    echo -e "  Password: ${GREEN}********${NC} (đã lưu trong .env)"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}\n"
    
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${WHITE}⚙️  QUẢN LÝ HỆ THỐNG:${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "  ${GEAR} PM2 status:     ${GREEN}pm2 status${NC}"
    echo -e "  ${GEAR} PM2 logs:       ${GREEN}pm2 logs tientienlorist${NC}"
    echo -e "  ${GEAR} Restart backend: ${GREEN}pm2 restart tientienlorist${NC}"
    echo -e "  ${GEAR} Nginx reload:   ${GREEN}sudo systemctl reload nginx${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}\n"
    
    if [ "$PROTOCOL" = "http" ]; then
        echo -e "${YELLOW}${LOCK} CÀI ĐẶT SSL/HTTPS:${NC}"
        echo -e "  Chạy: ${GREEN}sudo certbot --nginx -d $DOMAIN$([ -n \"$WWW_DOMAIN\" ] && echo \" -d $WWW_DOMAIN\")${NC}\n"
    fi
    
    echo -e "${WHITE}${SPARKLES} Hãy truy cập website và bắt đầu sử dụng!${NC}"
    echo -e "${WHITE}${FIRE} Chúc bạn thành công với website của mình!${NC}\n"
}

#############################################################################
# MAIN EXECUTION
#############################################################################

main() {
    # Display header
    log_header
    
    # Check root permission
    check_root
    
    # Update system first
    log_step "CẬP NHẬT HỆ THỐNG"
    log_info "Đang update apt packages..."
    apt-get update -qq
    apt-get install -y curl wget git build-essential
    log_success "Hệ thống đã được cập nhật"
    
    # Collect user information
    collect_info
    
    # Execute deployment steps
    install_nodejs
    install_nginx
    install_pm2
    install_dependencies
    create_env
    build_production
    create_data_files
    start_backend
    setup_nginx
    setup_ssl
    setup_firewall
    
    # Display success message
    display_success
    
    log_success "Deployment script đã hoàn thành!"
    log_info "Script location: $SCRIPT_DIR/auto-deploy.sh"
}

# Run main function
main "$@"
