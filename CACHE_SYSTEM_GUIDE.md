# ⚡ Hệ Thống Cache Đã Cài Đặt - Hướng Dẫn Sử Dụng

## 🎉 Tính Năng Đã Hoàn Thành

Hệ thống cache đã được cài đặt hoàn chỉnh với các thành phần sau:

### 1. ✅ **Cache Manager Backend** (`utils/cacheManager.js`)
- File-based caching system
- Auto-eviction khi cache đầy
- Cache statistics tracking
- Preload mechanism
- TTL (Time To Live) support
- Hit/Miss rate tracking

### 2. ✅ **Server API Endpoints** (`server.js`)
Các API đã được thêm vào:
- `GET /api/cache/stats` - Lấy thống kê cache
- `POST /api/cache/clear` - Xóa toàn bộ cache
- `POST /api/cache/preload` - Preload cache cho critical pages

### 3. ✅ **Cache Management Component** (`components/CacheManagement.tsx`)
UI component để quản lý cache trong admin panel với:
- Dashboard hiển thị stats (dung lượng, số lượng, hit rate)
- Nút Preload Cache
- Nút Clear Cache
- Bảng chi tiết các cache entries
- Auto-refresh mỗi 30 giây

## 📋 Cách Sử Dụng

### **Phần 1: Thêm Cache Tab vào Admin Panel**

Vì file `App.tsx` quá lớn (2300+ dòng), bạn có thể thêm cache tab theo 2 cách:

#### **Cách 1: Sửa thủ công** (Khuyến nghị nếu IDE bạn hỗ trợ find/replace)

1. **Tìm phần render admin tabs** (khoảng dòng 900-1000+), tìm code như:
```tsx
{/* TAB NAVIGATION */}
```

Hoặc search cho: `activeTab === 'products'` hoặc `activeTab === 'analytics'`

2. **Thêm Cache Tab button** vào tab navigation, sau tab 'Orders':
```tsx
<button
  onClick={() => setActiveTab('cache')}
  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
    activeTab === 'cache'
      ? 'bg-gradient-pink text-white shadow-lg'
      : 'glass hover:bg-white/50'
  }`}
>
  ⚡ Cache
</button>
```

3. **Thêm render logic cho Cache tab**, sau phần render `activeTab === 'analytics'` hoặc `'orders'`:
```tsx
{activeTab === 'cache' && (
  <CacheManagement backendURL={BACKEND_URL} />
)}
```

#### **Cách 2: Tạo file riêng và refactor**

Nếu muốn code gọn gàng hơn, bạn có thể:
1. Tạo component `AdminPanel.tsx` riêng
2. Move toàn bộ admin logic vào đó
3. Import vào `App.tsx`

## ⚡ Hướng Dẫn Sử Dụng Cache

### **1. Preload Cache (Tạo cache trước)**
Preload giúp khách hàng lần đầu vào website load cực nhanh:

1. Vào Admin Panel → Cache tab
2. Click nút **"⚡ Preload Cache"**
3. Hệ thống sẽ tự động:
   - Fetch tất cả critical pages (/, /api/database, /api/uploads)
   - Lưu vào cache
   - Hiển thị thông báo thành công

**Khi nào nên preload:**
- ✅ Sau khi thêm/sửa sản phẩm
- ✅ Sau khi thay đổi settings
- ✅ Sau khi deploy code mới
- ✅ Buổi sáng trước giờ cao điểm

### **2. Xem Thống Kê Cache**

Dashboard hiển thị:
- **Dung lượng**: Bao nhiêu MB đã dùng / tối đa
- **Số lượng**: Có bao nhiêu cache entries
- **Hit Rate**: Tỷ lệ cache trúng (càng cao càng tốt nghĩa là cache hoạt động hiệu quả)
- **Last Preload**: Lần cuối preload

### **3. Xóa Cache**

Khi nào cần xóa cache:
- ✅ Sau khi sửa nội dung quan trọng và muốn force refresh
- ✅ Khi cache bị lỗi/corrupted
- ✅ Khi testing

⚠️ **Lưu ý**: Sau khi xóa cache, website có thể chậm lại 1-2 phút cho đến khi cache rebuild.

## 🔧 Cấu Hình Nâng Cao

### Thay đổi Cache Settings

Mở `utils/cacheManager.js` và điều chỉnh:

```javascript
const MAX_CACHE_SIZE_MB = 500; // 500MB max (thay đổi nếu cần)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 giờ TTL
```

### Thêm Cache Middleware cho Routes Khác

Trong `server.js`, thêm cache middleware cho các routes cần cache:

```javascript
// Example: Cache static pages
app.use(cacheMiddleware({
  ttl: 3600000, // 1 hour
  include: ['/api/database', '/api/uploads'], // Chỉ cache những routes này
  exclude: ['/api/upload', '/api/login'] // Không cache những routes này
}));
```

### Tùy Chỉnh Preload Endpoints

Trong `server.js`, thêm/bớt endpoints cần preload:

```javascript
// POST: Preload cache
app.post('/api/cache/preload', async (req, res) => {
  try {
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('host');
    const baseURL = `${protocol}://${host}`;
    
    // Thêm/bớt endpoints ở đây
    const endpoints = [
      '/',
      '/api/database',
      '/api/uploads',
      // Thêm routes khác nếu cần
      '/api/analytics'
    ];
    
    const result = await preloadCache(baseURL, endpoints);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## 📊 Monitoring & Best Practices

### Best Practices
1. **Preload thường xuyên**: Nên preload 1-2 lần/ngày vào giờ ít traffic
2. **Monitor hit rate**: Hit rate > 70% là tốt, > 90% là excellent
3. **Clear cache khi cần**: Đừng sợ clear cache nếu nghi ngờ có vấn đề
4. **Check dung lượng**: Nếu cache > 80% max size, xem xét tăng MAX_CACHE_SIZE_MB

### Troubleshooting

**Cache không hoạt động:**
- Kiểm tra thư mục `.cache` có tồn tại không
- Check server logs xem có lỗi gì
- Restart server: `pm2 restart all`

**Hit rate quá thấp:**
- Có thể TTL quá ngắn → tăng CACHE_TTL_MS
- Có thể ít traffic → bình thường
- Có thể cần điều chỉnh exclude/include patterns

**Cache quá nhanh đầy:**
- Tăng MAX_CACHE_SIZE_MB
- Hoặc giảm CACHE_TTL_MS để auto-evict nhanh hơn

## 🚀 Deploy lên VPS

Sau khi thêm xong cache tab, deploy lên VPS:

```bash
# 1. Commit code
git add .
git commit -m "feat: Add cache management system"
git push origin main

# 2. SSH vào VPS và pull code
ssh user@your-vps
cd /path/to/project
git pull origin main

# 3. Install dependencies (nếu cần)
npm install

# 4. Rebuild frontend
npm run build

# 5. Restart server
pm2 restart all

# 6. Kiểm tra
pm2 logs
```

## ✅ Checklist Hoàn Thành

- [x] Cache Manager module
- [x] Server API endpoints
- [x] Cache Management Component
- [x] Documentation
- [ ] Thêm Cache tab vào Admin Panel UI (Cần làm thủ công theo hướng dẫn trên)
- [ ] Test trên localhost
- [ ] Deploy lên VPS
- [ ] Preload cache lần đầu

## 📞 Support

Nếu gặp vấn đề, check:
1. Server logs: `pm2 logs` hoặc check terminal
2. Browser console (F12)
3. File `.cache/index.json` để xem cache metadata

Chúc success! 🎉
