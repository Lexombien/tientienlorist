# 🎨 Hướng Dẫn Sử Dụng Biến Thể Sản Phẩm (Product Variants)

## 📋 Tổng Quan

Tính năng **Biến thể sản phẩm** cho phép bạn tạo các phiên bản khác nhau của cùng một sản phẩm, ví dụ:
- Cùng một bó hoa nhưng khác màu (Đỏ, Vàng, Xanh...)
- Cùng một sản phẩm nhưng khác kích thước (S, M, L, XL...)
- Bất kỳ biến thể nào khác mà bạn muốn phân loại

### ✨ Tính Năng Chính

- ✅ Thêm nhiều biến thể cho mỗi sản phẩm
- ✅ Mỗi biến thể có thể có SKU riêng hoặc dùng SKU sản phẩm mẹ
- ✅ Gán ảnh cho từng biến thể
- ✅ Khi click ảnh, hiển thị tên biến thể và SKU tương ứng trong lightbox

---

## 🚀 Cách Sử Dụng

### Bước 1: Thêm/Sửa Sản Phẩm

1. Vào trang **Admin** → Tab **Quản Lý Sản Phẩm**
2. Click vào sản phẩm muốn edit hoặc tạo sản phẩm mới
3. Modal "Cập nhật sản phẩm" sẽ hiện ra

### Bước 2: Nhập Thông Tin Cơ Bản

- **Tên sản phẩm**: Ví dụ: "Bó Hoa Hồng"
- **Mã SKU** (sản phẩm mẹ): Ví dụ: "HOA001"
- **Giá gốc / Giá khuyến mãi**
- **Danh mục**: Chọn các danh mục phù hợp

### Bước 3: Thêm Biến Thể

1. Cuộn xuống phần **"🎨 Biến thể sản phẩm"**
2. Nhập tên biến thể vào ô input (ví dụ: "Màu Đỏ")
3. Click nút **"+ Thêm"**
4. Biến thể mới sẽ xuất hiện trong danh sách

#### Ví dụ:
```
Biến thế #1: Màu Đỏ
├─ SKU: HOA001-RED (hoặc để trống để dùng HOA001)

Biến thể #2: Màu Vàng  
├─ SKU: HOA001-YEL (hoặc để trống để dùng HOA001)

Biến thể #3: Màu Trắng
├─ SKU: (để trống → sẽ dùng HOA001)
```

### Bước 4: Nhập SKU Riêng (Tùy Chọn)

Mỗi biến thể có thể có SKU riêng hoặc không:

- **Có SKU riêng**: Nhập vào ô "Mã SKU riêng" (ví dụ: `HOA001-RED`)
- **Không có SKU**: Để trống → Biến thể sẽ dùng SKU sản phẩm mẹ

> 💡 **Lưu ý**: Nếu cả sản phẩm mẹ và biến thể đều không có SKU, hệ thống sẽ hiển thị "-"

### Bước 5: Upload Ảnh

1. Click nút **"+ Tải ảnh lên"**
2. Chọn các ảnh sản phẩm (tối đa 10 ảnh)
3. Ảnh sẽ được upload và hiển thị trong grid

### Bước 6: Gán Biến Thể Cho Ảnh

Đây là bước quan trọng để liên kết ảnh với biến thể!

1. Dưới mỗi ảnh, bạn sẽ thấy dropdown **"Biến thể"**
2. Click vào dropdown và chọn biến thể tương ứng với ảnh đó
3. Ví dụ:
   - Ảnh 1 (hoa đỏ) → Chọn "Màu Đỏ"
   - Ảnh 2 (hoa vàng) → Chọn "Màu Vàng"
   - Ảnh 3 (hoa trắng) → Chọn "Màu Trắng"

> ⚠️ **Quan trọng**: Nếu sản phẩm có biến thể nhưng bạn không gán biến thể cho ảnh, SKU sẽ không hiển thị khi khách hàng click vào ảnh đó.

### Bước 7: Lưu Sản Phẩm

Click nút **"Lưu thông tin"** hoặc **"Thêm sản phẩm"**

---

## 🖼️ Cách Hoạt Động Trên Website

### Trên Trang Chủ

Khi khách hàng xem sản phẩm trên trang chủ:
- Hiển thị tất cả các ảnh như bình thường
- Nếu bật "Hiển thị SKU" trong Settings, SKU sẽ hiển thị ở góc ảnh (SKU sản phẩm mẹ)

### Khi Click Ảnh (Lightbox)

Khi khách hàng click vào ảnh:
1. Lightbox mở ra với ảnh phóng to
2. **Nếu ảnh đó được gán biến thể:**
   - Hiển thị badge đẹp mắt ở dưới ảnh
   - Badge gồm 2 phần:
     - **Tên biến thể**: "Màu Đỏ"
     - **SKU**: "HOA001-RED" (hoặc SKU sản phẩm mẹ nếu biến thể không có SKU riêng)

3. **Nếu ảnh không được gán biến thể:**
   - Không hiển thị badge biến thể
   - Chỉ hiển thị ảnh bình thường

---

## 💡 Use Cases Thực Tế

### Case 1: Bó Hoa Nhiều Màu

**Sản phẩm**: Bó Hoa Hồng Ecuador
**SKU sản phẩm mẹ**: `HOACAP-001`

**Biến thể**:
- Màu Đỏ → SKU: `HOACAP-001-RED`
- Màu Vàng → SKU: `HOACAP-001-YEL`
- Màu Hồng → SKU: `HOACAP-001-PINK`
- Mix 3 Màu → SKU: `HOACAP-001-MIX`

**Gán ảnh**:
- 3 ảnh đầu → "Màu Đỏ"
- 3 ảnh tiếp → "Màu Vàng"  
- 3 ảnh tiếp → "Màu Hồng"
- 1 ảnh cuối → "Mix 3 Màu"

### Case 2: Sản Phẩm Có Size

**Sản phẩm**: Chậu Cây Cảnh
**SKU sản phẩm mẹ**: `CAY-CANH-02`

**Biến thể**:
- Size S (15cm) → SKU: `CAY-CANH-02-S`
- Size M (25cm) → SKU: `CAY-CANH-02-M`
- Size L (35cm) → SKU: `CAY-CANH-02-L`

### Case 3: Không Cần SKU Riêng

**Sản phẩm**: Bó Hoa Tulip
**SKU sản phẩm mẹ**: `TUL-001`

**Biến thể** (tất cả dùng chung SKU `TUL-001`):
- Màu Đỏ → SKU: (để trống)
- Màu Vàng → SKU: (để trống)
- Màu Tím → SKU: (để trống)

---

## ❓ FAQ

### Q: Tôi có bắt buộc phải thêm biến thể không?

**A**: Không! Biến thể là tùy chọn. Nếu sản phẩm của bạn không có biến thể, bỏ qua phần này.

### Q: Nếu tôi không gán biến thể cho ảnh thì sao?

**A**: Ảnh vẫn hiển thị bình thường, nhưng lightbox sẽ không hiển thị badge biến thể/SKU.

### Q: Tôi có thể xóa biến thể không?

**A**: Có! Click vào icon 🗑️ (thùng rác) bên cạnh biến thể để xóa. Các ảnh đã gán biến thể đó sẽ tự động bỏ gán.

### Q: Tôi muốn thay đổi tên biến thể?

**A**: Click vào ô tên biến thể và chỉnh sửa trực tiếp, sau đó lưu sản phẩm.

### Q: SKU hiển thị như thế nào nếu biến thể không có SKU riêng?

**A**: Hệ thống sẽ hiển thị SKU sản phẩm mẹ. Nếu cả hai đều không có, hiển thị "-".

### Q: Tôi có thể có bao nhiêu biến thể?

**A**: Không giới hạn! Nhưng nên giữ số lượng hợp lý (3-10 biến thể) để dễ quản lý.

---

## 🎯 Best Practices

1. **Đặt tên biến thể rõ ràng**: Dùng tên dễ hiểu như "Màu Đỏ", "Size L" thay vì "V1", "V2"
   
2. **Quy chuẩn SKU**: Nên có quy tắc đặt SKU nhất quán, ví dụ:
   - `[SKU_MẸ]-[MÀU]`: HOA001-RED, HOA001-YEL
   - `[SKU_MẸ]-[SIZE]`: CAY02-S, CAY02-M, CAY02-L

3. **Upload ảnh theo thứ tự**: Upload ảnh theo nhóm biến thể để dễ gán
   - Upload hết ảnh đỏ → gán hết "Màu Đỏ"
   - Upload hết ảnh vàng → gán hết "Màu Vàng"

4. **Kiểm tra trước khi lưu**: Xem lại danh sách biến thể và gán ảnh trước khi lưu

5. **Test trên website**: Sau khi lưu, vào trang chủ và test click ảnh để xem badge hiển thị đúng chưa

---

## 🔧 Troubleshooting

### Vấn đề: Badge biến thể không hiển thị trong lightbox

**Nguyên nhân**: Ảnh chưa được gán biến thể

**Giải pháp**:
1. Mở lại modal edit sản phẩm
2. Kiểm tra dropdown "Biến thể" dưới mỗi ảnh
3. Chọn biến thể phù hợp
4. Lưu lại

### Vấn đề: SKU hiển thị "-"

**Nguyên nhân**: Cả sản phẩm mẹ và biến thể đều không có SKU

**Giải pháp**:
- Nhập SKU cho sản phẩm mẹ (ô "Mã sản phẩm")
- Hoặc nhập SKU riêng cho biến thể

### Vấn đề: Tôi muốn ảnh không thuộc biến thể nào

**Giải pháp**: Chọn "-- Không có --" trong dropdown biến thể

---

## 📚 Tài Liệu Kỹ Thuật

### Cấu Trúc Dữ Liệu

```typescript
// Product Variant
interface ProductVariant {
  id: string;          // Unique ID
  name: string;        // Tên biến thể (vd: "Màu Đỏ")
  sku?: string;        // SKU riêng (optional)
}

// Image with Metadata
interface ImageWithMetadata {
  url: string;         // URL ảnh
  filename?: string;   // Tên file
  alt?: string;        // Alt text
  title?: string;      // Title
  variantId?: string;  // ID biến thể liên kết (NEW!)
}

// Flower Product
interface FlowerProduct {
  id: string;
  title: string;
  sku?: string;                              // SKU sản phẩm mẹ
  variants?: ProductVariant[];               // Danh sách biến thể (NEW!)
  imagesWithMetadata?: ImageWithMetadata[];  // Ảnh + metadata
  // ... other fields
}
```

---

**🎉 Chúc bạn sử dụng tính năng biến thể thành công!**

Nếu có bất kỳ câu hỏi nào, hãy liên hệ với team support.
