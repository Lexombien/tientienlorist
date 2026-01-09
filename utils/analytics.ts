import { PageView, ProductClick, AnalyticsData } from '../types';

// Auto-detect backend URL
const isDevelopment = window.location.hostname === 'localhost' ||
    window.location.hostname.match(/^192\.168\./) ||
    window.location.hostname.match(/^10\./) ||
    window.location.hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./);

const BACKEND_URL = isDevelopment
    ? `http://${window.location.hostname}:3001`
    : '';

const SESSION_STORAGE_KEY = 'analytics_session';

// Generate or retrieve session ID
function getSessionId(): string {
    let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
    return sessionId;
}

// Detect device type from user agent
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const ua = navigator.userAgent.toLowerCase();

    // Check for tablet
    if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua)) {
        return 'tablet';
    }

    // Check for mobile
    if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/.test(ua)) {
        return 'mobile';
    }

    // Default to desktop
    return 'desktop';
}

// Load analytics data from server
export async function loadAnalyticsData(): Promise<AnalyticsData> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/analytics`);
        const result = await response.json();

        if (result.success && result.data) {
            return result.data;
        }
    } catch (error) {
        console.error('Error loading analytics data:', error);
    }

    return {
        pageViews: [],
        productClicks: [],
        sessionStart: Date.now()
    };
}

// Track page view (send to server)
export async function trackPageView(path?: string): Promise<void> {
    try {
        await fetch(`${BACKEND_URL}/api/analytics/page-view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: path || window.location.hash || '/',
                referrer: document.referrer,
                userAgent: navigator.userAgent,
                deviceType: getDeviceType(), // Added device type
                sessionId: getSessionId()
            })
        });
    } catch (error) {
        console.error('Error tracking page view:', error);
    }
}

// Track product click (send to server)
export async function trackProductClick(productId: string, productTitle: string, category: string): Promise<void> {
    try {
        await fetch(`${BACKEND_URL}/api/analytics/product-click`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId,
                productTitle,
                category,
                sessionId: getSessionId()
            })
        });
    } catch (error) {
        console.error('Error tracking product click:', error);
    }
}

// Clear old analytics data on server
export async function clearOldAnalytics(daysToKeep: number = 90): Promise<void> {
    try {
        const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
        const response = await fetch(`${BACKEND_URL}/api/analytics?olderThan=${cutoff}`, {
            method: 'DELETE'
        });
        const result = await response.json();

        if (result.success) {
            console.log('✅ Đã xóa dữ liệu cũ:', result.message);
        }
    } catch (error) {
        console.error('Error clearing old analytics:', error);
        throw error;
    }
}

// Export analytics data as JSON file
export async function exportAnalytics(): Promise<void> {
    try {
        const data = await loadAnalyticsData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting analytics:', error);
        throw error;
    }
}

// Clear all analytics data on server
export async function clearAllAnalytics(): Promise<void> {
    if (confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu thống kê trên server?')) {
        try {
            const response = await fetch(`${BACKEND_URL}/api/analytics`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.success) {
                alert('✅ ' + result.message);
                window.location.reload();
            }
        } catch (error) {
            console.error('Error clearing analytics:', error);
            alert('❌ Lỗi khi xóa dữ liệu!');
        }
    }
}

// Save analytics data to server (tương thích với legacy code)
export function saveAnalyticsData(data: AnalyticsData): void {
    // Deprecated: Dữ liệu giờ tự động save qua API track
    console.warn('saveAnalyticsData is deprecated. Data is now saved via API automatically.');
}
