#!/bin/bash

# 📦 BACKUP DATABASE SCRIPT
# Chạy TRƯỚC KHI deploy để backup data

BACKUP_DIR="database-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/database_$TIMESTAMP.json"

# Tạo folder backups
mkdir -p "$BACKUP_DIR"

echo "📦 Backing up database.json..."

if [ -f "database.json" ]; then
    cp database.json "$BACKUP_FILE"
    echo "✅ Backup saved: $BACKUP_FILE"
    
    # Hiển thị 5 backups gần nhất
    echo ""
    echo "📁 Recent backups:"
    ls -lht "$BACKUP_DIR" | head -6
    
    # Xóa backups cũ hơn 30 ngày
    find "$BACKUP_DIR" -name "database_*.json" -mtime +30 -delete
    echo "🧹 Cleaned backups older than 30 days"
else
    echo "⚠️  database.json not found!"
fi

echo ""
echo "💡 To restore a backup:"
echo "   cp $BACKUP_FILE database.json"
