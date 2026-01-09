/**
 * Zalo Bot Tracking Utility
 * Gửi thông tin click sản phẩm lên server để bot thông báo cho chủ shop
 */

// URL API tracking - SẼ CẬP NHẬT SAU KHI DEPLOY SERVER
const TRACKER_API_URL = 'https://YOUR_VPS_IP_OR_DOMAIN:3002/api/track-click';

/**
 * Track khi khách click vào sản phẩm
 */
export async function trackZaloBotClick(productName: string, productUrl: string, productId?: string) {
    // Chỉ track ở client-side (không track khi admin)
    if (window.location.hash === '#admin') {
        return;
    }

    try {
        // Gửi tracking request
        await fetch(TRACKER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productName,
                productUrl,
                productId: productId || null
            }),
            // keepalive đảm bảo request được gửi kể cả khi page unload
            keepalive: true
        });
    } catch (error) {
        // Silent fail - không ảnh hưởng UX
        console.debug('Zalo bot tracking failed:', error);
    }
}

/**
 * Cập nhật URL API khi có thông tin VPS
 */
export function updateTrackerApiUrl(newUrl: string) {
    // Sau khi deploy server, gọi hàm này trong App.tsx để update URL
    // VD: updateTrackerApiUrl('https://103.123.45.67:3002/api/track-click');
    console.log('Update tracker URL to:', newUrl);
    // Note: Vì TRACKER_API_URL là const, nên cần restart app hoặc dùng cách khác
    // Tốt nhất là lưu URL vào globalSettings và đọc từ đó
}
