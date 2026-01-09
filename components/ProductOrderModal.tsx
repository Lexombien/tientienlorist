import React, { useState, useEffect } from 'react';
import { FlowerProduct } from '../types';

interface ProductOrderModalProps {
  product: FlowerProduct;
  onClose: () => void;
  mediaMetadata?: Record<string, { alt?: string, title?: string, description?: string }>;
}

const ProductOrderModal: React.FC<ProductOrderModalProps> = ({ product, onClose, mediaMetadata = {} }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGiftMode, setIsGiftMode] = useState(false); // Tặng người khác mode
  const [showSuccessScreen, setShowSuccessScreen] = useState(false); // Success screen
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    note: '',
    // Thông tin người tặng (chỉ hiện khi isGiftMode = true)
    senderName: '',
    senderPhone: ''
  });
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null); // Selected variant ID
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Get Zalo link from localStorage or use default
  const getZaloLink = () => {
    try {
      const settings = localStorage.getItem('global_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        const phone = parsed.phoneNumber || '0900000000';
        return `https://zalo.me/${phone}`;
      }
    } catch {
      // Ignore
    }
    return 'https://zalo.me/0900000000';
  };

  // Get images with metadata
  const getFilenameFromUrl = (url: string) => {
    try {
      const parts = url.split('/');
      return decodeURIComponent(parts[parts.length - 1]);
    } catch {
      return '';
    }
  };

  const imagesToDisplay = (product.imagesWithMetadata && product.imagesWithMetadata.length > 0
    ? product.imagesWithMetadata
    : product.images.map(url => ({ url, alt: product.title, title: product.title })))
    .map(img => {
      const filename = getFilenameFromUrl(img.url);
      const meta = mediaMetadata[filename];
      return {
        ...img,
        alt: meta?.alt || img.alt || product.title,
        title: meta?.title || img.title || product.title
      };
    });

  // Auto-switch image when variant is selected
  useEffect(() => {
    if (selectedVariant && product.imagesWithMetadata) {
      // Find first image with matching variantId
      const variantImageIndex = product.imagesWithMetadata.findIndex(
        img => img.variantId === selectedVariant
      );

      if (variantImageIndex !== -1) {
        setCurrentImageIndex(variantImageIndex);
      }
    }
  }, [selectedVariant, product.imagesWithMetadata]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.phone || !formData.address) {
      setSubmitMessage('Vui lòng điền đầy đủ thông tin người nhận!');
      return;
    }

    if (isGiftMode && (!formData.senderName || !formData.senderPhone)) {
      setSubmitMessage('Vui lòng điền đầy đủ thông tin người tặng!');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/submit-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: product.title,
          productId: product.id,
          productPrice: product.salePrice,
          customerName: formData.name,
          customerPhone: formData.phone,
          customerAddress: formData.address,
          note: formData.note,
          // Thông tin người tặng (nếu có)
          isGift: isGiftMode,
          senderName: isGiftMode ? formData.senderName : undefined,
          senderPhone: isGiftMode ? formData.senderPhone : undefined,
          // Thông tin biến thể (nếu có)
          variantId: selectedVariant,
          variantName: selectedVariant
            ? product.variants?.find(v => v.id === selectedVariant)?.name
            : undefined,
          variantSKU: selectedVariant
            ? product.variants?.find(v => v.id === selectedVariant)?.sku || product.sku
            : product.sku
        })
      });

      // Check if response is OK before parsing
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', response.status, errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setShowSuccessScreen(true); // Show success screen instead of message
      } else {
        setSubmitMessage('❌ Có lỗi xảy ra. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitMessage('❌ Không thể gửi đơn hàng. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Screen
  if (showSuccessScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
        <div
          className="bg-white rounded-3xl max-w-2xl w-full p-8 md:p-12 text-center shadow-2xl animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Thank You Message */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎉 Cảm ơn bạn đã đặt hàng!
          </h2>

          <p className="text-lg text-gray-700 mb-2 font-semibold">
            Đơn hàng của bạn đã được gửi thành công!
          </p>

          <p className="text-gray-600 mb-8">
            Chúng tôi sẽ liên hệ với bạn sớm nhất qua <span className="font-bold text-blue-600">Zalo</span> hoặc <span className="font-bold text-green-600">Gọi điện</span> để xác nhận đơn hàng.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={getZaloLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.896 1.372 5.515 3.564 7.302V22l3.37-1.854c.958.27 1.969.416 3.022.416 5.523 0 10-4.145 10-9.243C22 6.145 17.523 2 12 2z" />
              </svg>
              Liên hệ Zalo ngay
            </a>

            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Trở về
            </button>
          </div>

          {/* Decorative Elements */}
          <div className="mt-8 flex justify-center gap-2">
            <span className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🎁</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>💐</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
          </div>
        </div>
      </div>
    );
  }

  // Order Form Screen
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl max-w-2xl w-full max-h-[95vh] shadow-2xl border-2 border-pink-200 animate-slideUp overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Compact */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white px-4 py-2.5 flex items-center justify-between z-10 shadow-lg flex-shrink-0">
          <h2 className="text-base font-bold">{product.title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent">

          <div className="p-3 sm:p-4">
            {/* Gallery Section - Very Compact */}
            <div className="mb-3">
              <h3 className="text-xs font-bold mb-1.5 gradient-text">📸 Ảnh</h3>

              {/* Image Gallery Container - with arrows OUTSIDE */}
              <div className="relative max-w-[280px] mx-auto mb-2 px-12">
                {/* Main Image */}
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={imagesToDisplay[currentImageIndex].url}
                    alt={imagesToDisplay[currentImageIndex].alt}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Navigation Arrows - FAR OUTSIDE IMAGE */}
                {imagesToDisplay.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev - 1 + imagesToDisplay.length) % imagesToDisplay.length)}
                      className="absolute -left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 text-white hover:bg-black/90 transition-all flex items-center justify-center shadow-lg hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % imagesToDisplay.length)}
                      className="absolute -right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 text-white hover:bg-black/90 transition-all flex items-center justify-center shadow-lg hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Image Counter - MOVED OUTSIDE IMAGE */}
              {imagesToDisplay.length > 1 && (
                <div className="text-center mt-1">
                  <span className="inline-block bg-black/60 text-white px-2 py-1 rounded-full text-[10px] font-bold">
                    {currentImageIndex + 1}/{imagesToDisplay.length}
                  </span>
                </div>
              )}

              {/* Thumbnails - Tiny */}
              {imagesToDisplay.length > 1 && (
                <div className="grid grid-cols-6 gap-1 max-w-[280px] mx-auto">
                  {imagesToDisplay.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded overflow-hidden border transition-all ${index === currentImageIndex
                        ? 'border-pink-500'
                        : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    >
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Variant Selection - Compact */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs font-bold mb-1.5 gradient-text">🎨 Biến thể</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {product.variants.map((variant) => {
                    const variantSKU = variant.sku || product.sku || '';
                    return (
                      <label
                        key={variant.id}
                        className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${selectedVariant === variant.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300 bg-white'
                          }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            name="variant"
                            value={variant.id}
                            checked={selectedVariant === variant.id}
                            onChange={(e) => setSelectedVariant(e.target.value)}
                            className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">{variant.name}</p>
                            {variantSKU && (
                              <p className="text-xs text-gray-500">SKU: {variantSKU}</p>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-6 p-4 bg-pink-50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-semibold">Giá bán:</span>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-pink-600">{formatPrice(product.salePrice)}</span>
                  <span className="text-sm line-through text-gray-400">{formatPrice(product.originalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Order Form - Ultra Compact */}
            <div>
              <h3 className="text-xs font-bold mb-2 gradient-text">📝 Thông tin</h3>

              {/* Checkbox Tặng người khác - Compact */}
              <div className="mb-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGiftMode}
                    onChange={(e) => setIsGiftMode(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-purple-300 text-purple-600 cursor-pointer"
                  />
                  <span className="ml-2 text-xs font-bold text-purple-700">
                    🎁 Quà tặng
                  </span>
                </label>
                {isGiftMode && (
                  <p className="mt-1 text-[10px] text-purple-600">
                    Điền thông tin người nhận + người tặng
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-2">
                {/* Thông tin người nhận */}
                <div className={isGiftMode ? 'p-2 bg-pink-50 rounded-lg border border-pink-200' : ''}>
                  {isGiftMode && (
                    <h4 className="text-[11px] font-bold text-pink-600 mb-1.5">👤 Người nhận</h4>
                  )}

                  <div className="space-y-1.5">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1 text-gray-700">
                        {isGiftMode ? 'Tên người nhận' : 'Họ tên'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-200"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold mb-1 text-gray-700">
                        {isGiftMode ? 'SĐT người nhận' : 'SĐT'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-200"
                        placeholder="0900000000"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold mb-1 text-gray-700">
                        Địa chỉ <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-200 resize-none"
                        rows={2}
                        placeholder="123 Đường ABC, Quận 1, TP.HCM"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Thông tin người tặng (chỉ hiện khi isGiftMode = true) */}
                {isGiftMode && (
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <h4 className="text-sm font-bold text-purple-600 mb-3">💝 Thông tin người tặng (Bạn)</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                          Họ và tên người tặng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.senderName}
                          onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                          className="glass-input w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                          placeholder="Tên của bạn"
                          required={isGiftMode}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                          SĐT người tặng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.senderPhone}
                          onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                          className="glass-input w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                          placeholder="SĐT của bạn"
                          required={isGiftMode}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all resize-none"
                    rows={2}
                    placeholder={isGiftMode ? "Lời nhắn gửi, thời gian giao hàng..." : "Giao giờ hành chính, gọi trước khi đến..."}
                  />
                </div>

                {submitMessage && (
                  <div className={`p-4 rounded-xl text-center font-semibold ${submitMessage.includes('✅')
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                    }`}>
                    {submitMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-pink text-white py-4 rounded-xl font-bold text-lg shadow-xl hover-glow-pink transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang gửi...' : '🛒 Đặt hàng ngay'}
                </button>
              </form>
            </div>
          </div>
        </div>
        {/* End Scrollable Content */}
      </div>
    </div>
  );
};

export default ProductOrderModal;
