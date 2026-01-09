import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tạo hoặc mở database
const db = new Database(join(__dirname, 'tracking.db'));

// Tạo bảng nếu chưa tồn tại
db.exec(`
  CREATE TABLE IF NOT EXISTS clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    product_url TEXT NOT NULL,
    product_id TEXT,
    user_ip TEXT,
    user_agent TEXT,
    referrer TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

/**
 * Lưu một lần click vào database
 */
export function saveClick(data) {
  const stmt = db.prepare(`
    INSERT INTO clicks (product_name, product_url, product_id, user_ip, user_agent, referrer)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  return stmt.run(
    data.productName,
    data.productUrl,
    data.productId || null,
    data.userIp || null,
    data.userAgent || null,
    data.referrer || null
  );
}

/**
 * Lấy lịch sử click gần nhất
 */
export function getRecentClicks(limit = 50) {
  const stmt = db.prepare(`
    SELECT * FROM clicks 
    ORDER BY timestamp DESC 
    LIMIT ?
  `);
  
  return stmt.all(limit);
}

/**
 * Lấy thống kê theo sản phẩm
 */
export function getProductStats() {
  const stmt = db.prepare(`
    SELECT 
      product_name,
      product_id,
      COUNT(*) as click_count,
      MAX(timestamp) as last_click
    FROM clicks
    GROUP BY product_name, product_id
    ORDER BY click_count DESC
  `);
  
  return stmt.all();
}

/**
 * Lấy tổng số click hôm nay
 */
export function getTodayStats() {
  const stmt = db.prepare(`
    SELECT COUNT(*) as total_clicks
    FROM clicks
    WHERE DATE(timestamp) = DATE('now')
  `);
  
  return stmt.get();
}

export default db;
