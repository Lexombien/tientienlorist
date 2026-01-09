
import React, { useState, useEffect } from 'react';
import { FlowerProduct } from '../types';
import { ZALO_NUMBER } from '../constants';
import { trackProductClick } from '../utils/analytics';
import { trackZaloBotClick } from '../utils/zaloBotTracking';

interface FlowerCardProps {
  product: FlowerProduct;
  onEdit?: (p: FlowerProduct) => void;
  isAdmin?: boolean;
  globalAspectRatio?: string;
  categoryImageInterval?: number;
  mediaMetadata?: Record<string, { alt?: string, title?: string, description?: string }>;
  onImageClick?: (
    images: { url: string; alt?: string; title?: string; variantId?: string }[],
    index: number,
    productInfo?: { title?: string; sku?: string; variants?: any[] }
  ) => void;
  showSKU?: boolean; // NEW: Show SKU badge on image
  zaloLink?: string; // NEW: Customizable Zalo link
  enablePriceDisplay?: boolean; // NEW: Show/hide price
  onOrderClick?: (product: FlowerProduct) => void; // NEW: Order button click handler
  productIndex?: number; // NEW: Index of product in list for lazy loading
}

const FlowerCard: React.FC<FlowerCardProps> = ({
  product,
  onEdit,
  isAdmin,
  globalAspectRatio = '3/4',
  categoryImageInterval = 3000,
  mediaMetadata = {},
  onImageClick,
  showSKU = false,
  zaloLink = 'https://zalo.me/0900000000',
  enablePriceDisplay = true,
  onOrderClick,
  productIndex = 0
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get transition class
  const transitionEffect = product.imageTransition || 'fade';
  const transitionClass = `transition-${transitionEffect}`;

  // Lazy load only from 5th product onward (index >= 4)
  const shouldLazyLoad = productIndex >= 4;

  // Helper function to extract filename from URL
  const getFilenameFromUrl = (url: string) => {
    try {
      const parts = url.split('/');
      return decodeURIComponent(parts[parts.length - 1]);
    } catch {
      return '';
    }
  };

  // Use imagesWithMetadata if available, but OVERRIDE with global media metadata from library if it exists
  const imagesToDisplay = (product.imagesWithMetadata && product.imagesWithMetadata.length > 0
    ? product.imagesWithMetadata
    : product.images.map(url => ({ url, alt: product.title, title: product.title })))
    .map(img => {
      const filename = getFilenameFromUrl(img.url);
      const meta = mediaMetadata[filename];

      return {
        ...img,
        //Ưu tiên dùng Meta từ thư viện ảnh nếu có
        alt: meta?.alt || img.alt || product.title,
        title: meta?.title || img.title || product.title
      };
    });

  const totalImages = imagesToDisplay.length;

  useEffect(() => {
    // Disable carousel in admin mode
    if (isAdmin) return;

    const interval = categoryImageInterval;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    }, totalImages > 1 ? interval : 999999); // Chỉ chạy interval nếu có > 1 ảnh

    return () => clearInterval(timer);
  }, [totalImages, categoryImageInterval, isAdmin]);

  const handleZaloRedirect = (e: React.MouseEvent) => {
    if (isAdmin) return; // Admin mode - no redirect
    e.preventDefault();
    e.stopPropagation();

    // Track product click for analytics (existing)
    trackProductClick(product.id, product.title, product.category);

    // 🆕 Track for Zalo Bot notification (send to shop owner)
    trackZaloBotClick(product.title, zaloLink, product.id);

    window.open(zaloLink, '_blank');
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (isAdmin) return; // Admin mode - no action
    e.stopPropagation(); // Ngăn không cho bubble lên parent

    // Track product click for analytics (existing)
    trackProductClick(product.id, product.title, product.category);

    // 🆕 Track for Zalo Bot notification (when clicking on image)
    trackZaloBotClick(product.title, zaloLink, product.id);

    // Click vào ảnh LUÔN LUÔN mở lightbox với product info
    if (onImageClick) {
      onImageClick(imagesToDisplay, currentImageIndex, {
        title: product.title,
        sku: product.sku,
        variants: product.variants
      });
    }
  };

  return (
    <div className={`glass-card glass rounded-2xl overflow-hidden transition-all duration-500 flex flex-col border border-white/30 ${!isAdmin ? 'group' : ''}`}>
      <div
        className={`relative overflow-hidden image-container ${transitionClass} ${!isAdmin ? 'cursor-zoom-in' : ''}`}
        style={{ paddingBottom: `${(parseInt(globalAspectRatio.split('/')[1]) / parseInt(globalAspectRatio.split('/')[0])) * 100}%`, height: 0 }}
        onClick={!isAdmin ? handleImageClick : undefined}
      >
        <div className="absolute inset-0">
          {isAdmin ? (
            // Admin mode: Only show first image, no carousel
            <img
              src={imagesToDisplay[0].url}
              alt={imagesToDisplay[0].alt}
              title={imagesToDisplay[0].title}
              className="active active-image w-full h-full object-cover absolute top-0 left-0"
              {...(shouldLazyLoad ? { loading: 'lazy' } : {})}
            />
          ) : (
            // User mode: Full carousel
            imagesToDisplay.map((imgData, index) => (
              <img
                key={index}
                src={imgData.url}
                alt={imgData.alt}
                title={imgData.title}
                className={`w-full h-full object-cover absolute top-0 left-0 ${index === currentImageIndex ? 'active active-image' : ''}`}
                {...(shouldLazyLoad ? { loading: 'lazy' } : {})}
              />
            ))
          )}
        </div>

        {isAdmin && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(product); }}
            className="absolute top-2 right-2 bg-gradient-pink text-white p-2 rounded-full shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
        )}

        {/* SKU Badge - Dynamic: Changes based on current image's variant */}
        {!isAdmin && showSKU && (() => {
          const currentImg = imagesToDisplay[currentImageIndex];
          let displaySKU = product.sku; // Default to parent SKU

          // If current image has a variant, try to get variant SKU
          if (currentImg?.variantId && product.variants) {
            const variant = product.variants.find(v => String(v.id) === String(currentImg.variantId));
            if (variant) {
              displaySKU = variant.sku || product.sku; // Variant SKU or fallback to parent
            }
          }

          // Only show if there's a SKU to display
          if (!displaySKU) return null;

          return (
            <div className="absolute bottom-2 left-2 z-10 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-[9px] font-bold">
              {displaySKU}
            </div>
          );
        })()}

        {!isAdmin && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="badge-glass bg-gradient-pink text-white px-6 py-3 text-sm font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
              Xem ảnh
            </span>
          </div>
        )}
      </div>

      {/* Info Section - Click to Zalo */}
      <div
        className={`p-3 md:p-4 flex flex-col flex-grow ${!isAdmin ? 'cursor-pointer hover:bg-pink-50/50 transition-colors' : ''}`}
        onClick={!isAdmin ? handleZaloRedirect : undefined}
      >
        <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-2 leading-snug group-hover:text-[var(--primary-pink)] transition-colors" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-title, inherit)' }}>
          {product.title}
        </h3>

        <div className="mt-auto space-y-1">
          {enablePriceDisplay && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-base md:text-lg font-bold" style={{ color: 'var(--primary-pink)', fontFamily: 'var(--font-price, inherit)' }}>
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-xs md:text-sm line-through opacity-60" style={{ color: 'var(--text-secondary)' }}>
                {formatPrice(product.originalPrice)}
              </span>
            </div>
          )}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-pink-200 to-transparent my-2" />
          {!isAdmin && (
            <button
              className="w-full bg-gradient-pink text-white py-3 rounded-xl text-xs font-bold shadow-lg hover-glow-pink transition-all flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                if (onOrderClick) {
                  // Use modal if onOrderClick is provided
                  onOrderClick(product);
                } else {
                  // Fallback to Zalo redirect
                  handleZaloRedirect(e);
                }
              }}
            >
              ĐẶT NGAY
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowerCard;
