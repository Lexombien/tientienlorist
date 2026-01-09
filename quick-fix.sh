#!/bin/bash

#############################################################################
# 🚀 QUICK FIX SCRIPT - Tientien Florist
#############################################################################
# Script này fix nhanh các lỗi thường gặp KHÔNG cần deploy lại toàn bộ
# 
# Sử dụng khi:
# - Ảnh upload không hiển thị
# - API không kết nối được
# - Backend bị crash
#
# Usage: sudo bash quick-fix.sh
#############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 QUICK FIX - TIENTIEN FLORIST${NC}"
echo "================================"
echo ""

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}📍 Working directory: $SCRIPT_DIR${NC}"
echo ""

# 1. Fix missing axios dependency
echo -e "${BLUE}📦 1. CHECKING DEPENDENCIES...${NC}"
if ! npm list axios &> /dev/null; then
    echo -e "${YELLOW}⚠️  axios is missing, installing...${NC}"
    npm install axios
    echo -e "${GREEN}✅ axios installed${NC}"
else
    echo -e "${GREEN}✅ axios is already installed${NC}"
fi
echo ""

# 2. Check and create uploads folder
echo -e "${BLUE}📁 2. CHECKING UPLOADS FOLDER...${NC}"
if [ ! -d "uploads" ]; then
    mkdir -p uploads
    chmod 755 uploads
    echo -e "${GREEN}✅ Created uploads folder${NC}"
else
    echo -e "${GREEN}✅ uploads folder exists${NC}"
fi

# Fix permissions
chown -R www-data:www-data uploads 2>/dev/null || chown -R $USER:$USER uploads
chmod 755 uploads
echo -e "${GREEN}✅ Fixed permissions${NC}"
echo ""

# 3. Restart PM2
echo -e "${BLUE}⚙️  3. RESTARTING BACKEND...${NC}"

# Delete duplicate processes if any
pm2 delete floral-backend 2>/dev/null || true

# Restart main process
if pm2 list | grep -q "tientienlorist"; then
    pm2 restart tientienlorist --update-env
    echo -e "${GREEN}✅ Restarted tientienlorist${NC}"
else
    # Start if not running
    pm2 start server.js --name tientienlorist --update-env
    echo -e "${GREEN}✅ Started tientienlorist${NC}"
fi

pm2 save
echo ""

# Wait for backend to start
sleep 3

# 4. Test backend
echo -e "${BLUE}🧪 4. TESTING BACKEND...${NC}"
if curl -s http://localhost:3001/api/health | grep -q "OK"; then
    echo -e "${GREEN}✅ Backend is responding!${NC}"
else
    echo -e "${RED}❌ Backend is not responding${NC}"
    echo -e "${YELLOW}Check logs: pm2 logs tientienlorist${NC}"
fi
echo ""

# 5. Clean up old Nginx configs
echo -e "${BLUE}🧹 5. CLEANING UP OLD CONFIGS...${NC}"

# Get current domain from existing config
CURRENT_DOMAIN=$(ls /etc/nginx/sites-available/ | grep -v default | head -1)

if [ -f "/etc/nginx/sites-enabled/floral-shop" ]; then
    echo -e "${YELLOW}⚠️  Found old 'floral-shop' config, removing...${NC}"
    rm -f /etc/nginx/sites-enabled/floral-shop
    rm -f /etc/nginx/sites-available/floral-shop
    echo -e "${GREEN}✅ Removed floral-shop config${NC}"
fi

# Ensure current domain is enabled
if [ -n "$CURRENT_DOMAIN" ] && [ -f "/etc/nginx/sites-available/$CURRENT_DOMAIN" ]; then
    ln -sf "/etc/nginx/sites-available/$CURRENT_DOMAIN" "/etc/nginx/sites-enabled/"
    echo -e "${GREEN}✅ Enabled $CURRENT_DOMAIN${NC}"
fi

# Remove default if exists
rm -f /etc/nginx/sites-enabled/default

# Fix Nginx root directive
echo -e "${BLUE}🔧 6. FIXING NGINX ROOT DIRECTIVE...${NC}"
if [ -n "$CURRENT_DOMAIN" ] && [ -f "/etc/nginx/sites-available/$CURRENT_DOMAIN" ]; then
    # Backup config
    cp "/etc/nginx/sites-available/$CURRENT_DOMAIN" "/etc/nginx/sites-available/$CURRENT_DOMAIN.backup.$(date +%s)"
    
    # Check if root is pointing to wrong location (not dist/)
    if grep -q "root /var/www/tientienlorist;" "/etc/nginx/sites-available/$CURRENT_DOMAIN"; then
        echo -e "${YELLOW}⚠️  Root directive pointing to wrong location, fixing...${NC}"
        
        # Fix root to point to dist/ (except for uploads location which needs parent dir)
        # Change main root from /var/www/tientienlorist to /var/www/tientienlorist/dist
        sed -i 's|root /var/www/tientienlorist;$|root /var/www/tientienlorist/dist;|' "/etc/nginx/sites-available/$CURRENT_DOMAIN"
        
        # Fix uploads location to use parent directory
        sed -i '/location \/uploads\/ {/,/}/ {
            s|root .*|root /var/www/tientienlorist;|
        }' "/etc/nginx/sites-available/$CURRENT_DOMAIN"
        
        echo -e "${GREEN}✅ Fixed Nginx root directive${NC}"
    else
        echo -e "${GREEN}✅ Nginx root already points to dist/${NC}"
    fi
    
    # 🔥 CRITICAL FIX: Ensure uploads location uses correct root path
    echo -e "${YELLOW}⚠️  Fixing uploads location root path (common issue)...${NC}"
    # Fix root in location ^~ /uploads/ - must point to parent dir, not dist/
    sed -i '/location \^~ \/uploads\/ {/,/}/ s|root /var/www/tientienlorist/dist;|root /var/www/tientienlorist;|' "/etc/nginx/sites-available/$CURRENT_DOMAIN"
    echo -e "${GREEN}✅ Fixed uploads location root path${NC}"
    
    # Fix uploads location priority (use ^~ to prevent regex override)
    if grep -q "location /uploads/ {" "/etc/nginx/sites-available/$CURRENT_DOMAIN"; then
        echo -e "${YELLOW}⚠️  Fixing uploads location priority...${NC}"
        sed -i 's|location /uploads/ {|location ^~ /uploads/ {|' "/etc/nginx/sites-available/$CURRENT_DOMAIN"
        echo -e "${GREEN}✅ Fixed uploads location priority${NC}"
    fi
    
    # Also remove any broken alias directives for uploads
    if grep -q "alias.*uploads/" "/etc/nginx/sites-available/$CURRENT_DOMAIN"; then
        echo -e "${YELLOW}⚠️  Removing broken 'alias' directive...${NC}"
        sed -i '/location \/uploads\/ {/,/}/ {
            /alias/d
            /try_files/d
        }' "/etc/nginx/sites-available/$CURRENT_DOMAIN"
        echo -e "${GREEN}✅ Removed alias directive${NC}"
    fi
fi
echo ""

# 7. Test and reload Nginx
echo -e "${BLUE}🌐 7. RELOADING NGINX...${NC}"
if nginx -t 2>&1 | grep -q "successful"; then
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}❌ Nginx config has errors!${NC}"
    nginx -t
fi
echo ""

# 8. Summary
echo "================================"
echo -e "${GREEN}✅ QUICK FIX COMPLETED!${NC}"
echo "================================"
echo ""
echo -e "${BLUE}📊 Status Check:${NC}"
echo ""

echo "PM2 Processes:"
pm2 status

echo ""
echo "Nginx Config:"
nginx -T 2>&1 | grep "server_name" | head -3

echo ""
echo -e "${BLUE}📝 Useful Commands:${NC}"
echo "  - Check backend logs: ${GREEN}pm2 logs tientienlorist${NC}"
echo "  - Restart backend: ${GREEN}pm2 restart tientienlorist${NC}"
echo "  - Check Nginx logs: ${GREEN}sudo tail -f /var/log/nginx/error.log${NC}"
echo "  - Test backend API: ${GREEN}curl http://localhost:3001/api/health${NC}"
echo ""

echo -e "${YELLOW}💡 If issues persist, run full deployment:${NC}"
echo "   ${GREEN}sudo bash auto-deploy.sh${NC}"
echo ""
