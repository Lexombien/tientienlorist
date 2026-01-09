#!/bin/bash

#############################################################################
# 🔄 AUTO UPDATE SCRIPT - TIENTIEN FLORIST
# Cập nhật code MỚI NHẤT từ GitHub mà KHÔNG mất data
# 
# Sử dụng: sudo bash auto-update.sh
#############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Emojis
CHECK="✅"
CROSS="❌"
ROCKET="🚀"
GEAR="⚙️"
FIRE="🔥"

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
    echo "║     🔄 TIENTIEN FLORIST - AUTO UPDATE SCRIPT 🔄      ║"
    echo "║                                                       ║"
    echo "║        Cập nhật code mới - Giữ nguyên data!          ║"
    echo "║                                                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
}

# Check if running as root or sudo
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        log_error "Script này cần chạy với sudo!"
        log_info "Chạy lại: sudo bash auto-update.sh"
        exit 1
    fi
    log_success "Đang chạy với quyền sudo"
}

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
log_info "Working directory: $SCRIPT_DIR"
cd "$SCRIPT_DIR"

#############################################################################
# MAIN UPDATE PROCESS
#############################################################################

main_update() {
    log_header
    check_root
    
    # Step 1: Backup database.json
    log_step "BƯỚC 1: BACKUP DATABASE.JSON"
    
    if [ -f "database.json" ]; then
        mkdir -p database-backups 2>/dev/null
        BACKUP_FILE="database-backups/database_$(date +%Y%m%d_%H%M%S).json"
        cp database.json "$BACKUP_FILE"
        log_success "📦 Đã backup: $BACKUP_FILE"
    else
        log_warning "⚠️  database.json không tồn tại (dự án mới)"
    fi
    
    # Step 2: Pull latest code from GitHub
    log_step "BƯỚC 2: PULL CODE MỚI TỪ GITHUB"
    
    log_info "Đang stash local changes (nếu có)..."
    git stash
    
    log_info "Đang pull code mới nhất từ GitHub..."
    if git pull origin main; then
        log_success "Code đã được cập nhật từ GitHub"
    else
        log_error "Lỗi khi pull code!"
        log_error "Check git status và fix conflicts nếu có"
        exit 1
    fi
    
    # Step 3: Install/Update dependencies
    log_step "BƯỚC 3: CẬP NHẬT DEPENDENCIES"
    
    log_info "Đang chạy npm install..."
    log_warning "Quá trình này có thể mất 1-3 phút..."
    
    if npm install --production=false 2>&1 | while read line; do echo "  $line"; done; then
        log_success "Dependencies đã được cập nhật"
    else
        log_error "Lỗi khi cài đặt dependencies!"
        exit 1
    fi
    
    # Step 4: Build production
    log_step "BƯỚC 4: BUILD PRODUCTION MỚI"
    
    log_info "Xóa build cũ..."
    rm -rf dist
    rm -rf node_modules/.vite
    
    log_info "Đang build production..."
    log_warning "Quá trình này có thể mất 1-2 phút..."
    
    if npm run build 2>&1 | while read line; do echo "  $line"; done; then
        if [ -d "dist" ]; then
            DIST_SIZE=$(du -sh dist | cut -f1)
            log_success "Build thành công! Kích thước: $DIST_SIZE"
        else
            log_error "Build thất bại! Folder dist không tồn tại"
            exit 1
        fi
    else
        log_error "Build thất bại!"
        exit 1
    fi
    
    # Step 5: Restart backend (PM2)
    log_step "BƯỚC 5: RESTART BACKEND"
    
    if pm2 list | grep -q "tientienlorist"; then
        log_info "Đang restart backend với PM2..."
        pm2 restart tientienlorist
        sleep 2
        
        if pm2 list | grep -q "online"; then
            log_success "Backend đã được restart thành công"
        else
            log_error "Backend restart failed!"
            pm2 logs tientienlorist --lines 20
        fi
    else
        log_warning "PM2 process 'tientienlorist' không tồn tại"
        log_info "Khởi động backend lần đầu..."
        pm2 start server.js --name "tientienlorist"
        pm2 save
    fi
    
    # Step 6: Reload Nginx
    log_step "BƯỚC 6: RELOAD NGINX"
    
    log_info "Đang test Nginx config..."
    if nginx -t 2>&1 | grep -q "successful"; then
        log_success "Nginx config hợp lệ"
        
        log_info "Đang reload Nginx..."
        systemctl reload nginx
        log_success "Nginx đã được reload"
    else
        log_error "Nginx config không hợp lệ!"
        nginx -t
    fi
    
    # Step 7: Clear caches
    log_step "BƯỚC 7: CLEAR CACHES"
    
    if [ -d "/var/cache/nginx" ]; then
        log_info "Đang clear Nginx cache..."
        rm -rf /var/cache/nginx/* 2>/dev/null
        log_success "Nginx cache đã được xóa"
    fi
    
    # Step 8: Verify update
    log_step "BƯỚC 8: KIỂM TRA CẬP NHẬT"
    
    log_info "Kiểm tra backend API..."
    sleep 2
    if curl -s http://localhost:3001/api/health | grep -q "OK" 2>/dev/null; then
        log_success "✅ Backend API hoạt động bình thường"
    else
        log_warning "⚠️  Backend API chưa responding (có thể cần thêm thời gian)"
    fi
    
    log_info "Kiểm tra build có variant code..."
    if grep -r "variantId" dist/assets/*.js > /dev/null 2>&1; then
        log_success "✅ Build có chứa variant features"
    fi
    
    # Final success message
    log_step "🎉 CẬP NHẬT HOÀN TẤT! 🎉"
    
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║                                                       ║"
    echo "║        ✨ CODE ĐÃ ĐƯỢC CẬP NHẬT THÀNH CÔNG! ✨       ║"
    echo "║                                                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ DATA ĐƯỢC GIỮ NGUYÊN${NC}"
    echo -e "   - database.json: Không thay đổi"
    echo -e "   - uploads/: Không thay đổi"
    echo -e "   - Backup: $BACKUP_FILE"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}\n"
    
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${WHITE}📱 QUAN TRỌNG - CHECK BROWSER:${NC}"
    echo -e "   1. Hard refresh: Ctrl + Shift + R"
    echo -e "   2. Hoặc clear cache: Ctrl + Shift + Delete"
    echo -e "   3. Hoặc mở Incognito mode để test"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}\n"
    
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${WHITE}⚙️  QUẢN LÝ HỆ THỐNG:${NC}"
    echo -e "   ${GEAR} PM2 status:     ${GREEN}pm2 status${NC}"
    echo -e "   ${GEAR} PM2 logs:       ${GREEN}pm2 logs tientienlorist${NC}"
    echo -e "   ${GEAR} Restart backend: ${GREEN}pm2 restart tientienlorist${NC}"
    echo -e "   ${GEAR} Nginx reload:   ${GREEN}sudo systemctl reload nginx${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}\n"
    
    log_success "Update script đã hoàn thành!"
}

# Run main function
main_update "$@"
