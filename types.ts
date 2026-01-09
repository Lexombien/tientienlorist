// Image with SEO metadata
export interface ImageWithMetadata {
  url: string; // Base64 data URL or blob URL
  filename?: string; // Original filename for SEO
  alt?: string; // Alt text for accessibility and SEO
  title?: string; // Title attribute for SEO
  description?: string; // Description for better context
  variantId?: string; // NEW: Tên biến thể liên kết với ảnh này (vd: "Đỏ", "Vàng")
}

// NEW: Product Variant interface
export interface ProductVariant {
  id: string; // Unique variant ID
  name: string; // Variant name (vd: "Màu Đỏ", "Màu Vàng", "Size L")
  sku?: string; // Variant-specific SKU (nếu không có thì dùng SKU sản phẩm mẹ)
}

export interface FlowerProduct {
  id: string;
  title: string;
  originalPrice: number;
  salePrice: number;
  images: string[]; // Legacy: array of URLs (kept for backward compatibility)
  imagesWithMetadata?: ImageWithMetadata[]; // NEW: images with SEO metadata
  category: string; // Primary category (kept for backward compatibility)
  categories?: string[]; // NEW: Multiple categories support
  sku?: string; // NEW: Product SKU/Code (SKU sản phẩm mẹ)
  variants?: ProductVariant[]; // NEW: List of product variants
  switchInterval?: number; // Time in milliseconds for image slider (deprecated - use category settings)
  aspectRatio?: string; // Aspect ratio for images: '1/1', '3/4', '4/3', '16/9'
  order?: number; // Order within category for sorting
  imageTransition?: string; // Image transition effect
}

export type PaginationType = 'none' | 'loadmore' | 'infinite' | 'pagination';

export type ImageTransitionEffect =
  | 'none'
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'zoom-in'
  | 'zoom-out'
  | 'flip-horizontal'
  | 'flip-vertical'
  | 'rotate-left'
  | 'rotate-right'
  | 'blur-fade'
  | 'glitch'
  | 'wipe-left'
  | 'wipe-right'
  | 'wipe-up'
  | 'wipe-down'
  | 'diagonal-left'
  | 'diagonal-right'
  | 'cube-left'
  | 'cube-right'
  | 'bounce'
  | 'elastic'
  | 'swing';

export interface CategorySettings {
  name: string;
  displayName?: string; // Renamed display name
  itemsPerPage: number; // Number of products to show
  paginationType: PaginationType; // Pagination method
  imageTransition?: ImageTransitionEffect; // Default transition for category
  imageInterval?: number; // Time in milliseconds for image slider (default for all products in this category)
}

export interface AppState {
  zaloNumber: string;
  products: FlowerProduct[];
  categories: string[];
  categorySettings?: Record<string, CategorySettings>;
}

// Analytics Types
export interface PageView {
  timestamp: number;
  path: string;
  referrer?: string;
  userAgent?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop'; // Added device type
  sessionId?: string;
}

export interface ProductClick {
  timestamp: number;
  productId: string;
  productTitle: string;
  category: string;
  sessionId?: string;
}

export interface AnalyticsData {
  pageViews: PageView[];
  productClicks: ProductClick[];
  sessionStart?: number;
}

export interface AnalyticsStats {
  totalViews: number;
  uniqueVisitors: number;
  topProducts: { productId: string; title: string; clicks: number }[];
  viewsByDate: Record<string, number>;
  viewsByHour: Record<number, number>;
  clicksByProduct: Record<string, number>;
}

// Order Management Types
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string; // Unique order ID
  orderNumber: string; // Display order number (e.g., "#1234")
  createdAt: number; // Timestamp
  status: OrderStatus;

  // Customer info
  customerName: string;
  customerPhone: string;
  customerAddress: string;

  // Gift info (optional)
  isGift?: boolean;
  senderName?: string;
  senderPhone?: string;

  // Product info
  productId: string;
  productName: string;
  productPrice: number;

  // Variant info (optional)
  variantId?: string;
  variantName?: string;
  variantSKU?: string;

  // Additional info
  note?: string;

  // Admin notes
  adminNotes?: string;
}
