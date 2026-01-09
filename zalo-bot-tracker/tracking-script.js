/**
 * Zalo Bot Product Click Tracker
 * Nhúng script này vào website để theo dõi click vào link sản phẩm
 * 
 * Cách sử dụng:
 * 1. Thêm script này vào website
 * 2. Thêm attribute data-track="product" vào các link sản phẩm
 * 3. Thêm attribute data-product-name="Tên sản phẩm" để tracking
 */

(function () {
    'use strict';

    // Cấu hình - THAY ĐỔI URL NÀY
    const TRACKER_API_URL = 'https://YOUR-VPS-IP-OR-DOMAIN:3002/api/track-click';

    /**
     * Gửi thông tin click về server
     */
    function trackClick(productName, productUrl, productId) {
        // Không chặn navigation, gửi async
        fetch(TRACKER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productName: productName,
                productUrl: productUrl,
                productId: productId || null
            }),
            // Sử dụng keepalive để đảm bảo request được gửi kể cả khi page unload
            keepalive: true
        }).catch(err => {
            // Silent fail - không ảnh hưởng user experience
            console.debug('Track failed:', err);
        });
    }

    /**
     * Khởi tạo tracking cho tất cả link được đánh dấu
     */
    function initTracking() {
        // Tìm tất cả các link có data-track="product"
        const productLinks = document.querySelectorAll('a[data-track="product"]');

        productLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                const productName = this.getAttribute('data-product-name') || this.textContent.trim() || 'Unknown';
                const productUrl = this.href;
                const productId = this.getAttribute('data-product-id');

                // Track click
                trackClick(productName, productUrl, productId);

                // Không ngăn default behavior - link vẫn hoạt động bình thường
            });
        });

        console.log(`[Zalo Tracker] Đã khởi tạo tracking cho ${productLinks.length} sản phẩm`);
    }

    // Khởi tạo khi DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
    } else {
        initTracking();
    }

    // Expose function để có thể track manually nếu cần
    window.zaloTracker = {
        track: trackClick
    };
})();
