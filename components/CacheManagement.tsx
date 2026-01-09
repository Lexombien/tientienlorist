import React, { useState, useEffect } from 'react';

interface CacheStats {
    entryCount: number;
    totalSizeMB: number;
    maxSizeMB: number;
    usagePercent: string;
    totalHits: number;
    totalMisses: number;
    hitRate: number;
    createdAt: number;
    lastPreload: number | null;
    entries: Array<{
        key: string;
        sizeMB: string;
        age: number;
        hits: number;
        ttl: number;
    }>;
}

interface CacheManagementProps {
    backendURL: string;
}

const CacheManagement: React.FC<CacheManagementProps> = ({ backendURL }) => {
    const [stats, setStats] = useState<CacheStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isPreloading, setIsPreloading] = useState(false);

    // Load cache stats
    const loadStats = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${backendURL}/api/cache/stats`);
            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to load cache stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Clear all cache
    const handleClearCache = async () => {
        if (!confirm('Bạn có chắc muốn xóa toàn bộ cache? Điều này có thể làm website chậm lại tạm thời.')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${backendURL}/api/cache/clear`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: '✅ Đã xóa toàn bộ cache thành công!' });
                loadStats();
            } else {
                setMessage({ type: 'error', text: `❌ Lỗi: ${data.error}` });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: `❌ Lỗi: ${error.message}` });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    // Preload cache
    const handlePreload = async () => {
        setIsPreloading(true);
        setMessage({ type: 'success', text: '⏳ Đang preload cache...' });

        try {
            const response = await fetch(`${backendURL}/api/cache/preload`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: '✅ Đã preload cache thành công!' });
                loadStats();
            } else {
                setMessage({ type: 'error', text: `❌ Lỗi preload: ${data.error}` });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: `❌ Lỗi: ${error.message}` });
        } finally {
            setIsPreloading(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    // Load stats on mount
    useEffect(() => {
        loadStats();
        // Auto refresh every 30 seconds
        const interval = setInterval(loadStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Đang tải thống kê cache...</p>
                </div>
            </div>
        );
    }

    const formatBytes = (mb: number) => {
        if (mb >= 1000) return `${(mb / 1024).toFixed(2)} GB`;
        return `${mb.toFixed(2)} MB`;
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('vi-VN');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        ⚡ Quản Lý Cache
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Tăng tốc website bằng bộ nhớ đệm thông minh
                    </p>
                </div>
                <button
                    onClick={loadStats}
                    disabled={loading}
                    className="pill-button glass-strong px-4 py-2 text-sm hover-glow-pink"
                >
                    🔄 Làm mới
                </button>
            </div>

            {/* Message */}
            {message && (
                <div
                    className={`glass-strong p-4 rounded-2xl border-2 animate-pulse ${message.type === 'success'
                        ? 'border-green-300 bg-green-50/50'
                        : 'border-red-300 bg-red-50/50'
                        }`}
                >
                    <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                        {message.text}
                    </p>
                </div>
            )}

            {stats && (
                <>
                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Total Size */}
                        <div className="glass-strong p-6 rounded-2xl border border-pink-200/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">💾</span>
                                <span className="text-xs font-bold uppercase text-gray-500">Dung lượng</span>
                            </div>
                            <p className="text-3xl font-bold" style={{ color: 'var(--primary-pink)' }}>
                                {formatBytes(stats.totalSizeMB)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                / {formatBytes(stats.maxSizeMB)} ({stats.usagePercent}%)
                            </p>
                            <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-pink transition-all"
                                    style={{ width: `${Math.min(parseFloat(stats.usagePercent), 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Entry Count */}
                        <div className="glass-strong p-6 rounded-2xl border border-blue-200/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">📦</span>
                                <span className="text-xs font-bold uppercase text-gray-500">Số lượng</span>
                            </div>
                            <p className="text-3xl font-bold text-blue-600">
                                {stats.entryCount}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                cache entries
                            </p>
                        </div>

                        {/* Hit Rate */}
                        <div className="glass-strong p-6 rounded-2xl border border-green-200/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">🎯</span>
                                <span className="text-xs font-bold uppercase text-gray-500">Hiệu suất</span>
                            </div>
                            <p className="text-3xl font-bold text-green-600">
                                {stats.hitRate.toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {stats.totalHits} hits / {stats.totalMisses} misses
                            </p>
                        </div>

                        {/* Last Preload */}
                        <div className="glass-strong p-6 rounded-2xl border border-purple-200/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">⚡</span>
                                <span className="text-xs font-bold uppercase text-gray-500">Preload</span>
                            </div>
                            <p className="text-sm font-semibold text-purple-600">
                                {stats.lastPreload ? formatDate(stats.lastPreload) : 'Chưa có'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Lần cuối preload
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="glass-strong p-6 rounded-2xl border border-pink-200/50">
                        <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
                            ⚙️ Thao tác
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Preload Cache */}
                            <button
                                onClick={handlePreload}
                                disabled={isPreloading || loading}
                                className="pill-button bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 font-bold shadow-lg hover-glow-pink active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPreloading ? '⏳ Đang preload...' : '⚡ Preload Cache'}
                            </button>

                            {/* Clear Cache */}
                            <button
                                onClick={handleClearCache}
                                disabled={loading}
                                className="pill-button bg-gradient-to-r from-red-500 to-rose-600 text-white py-4 px-6 font-bold shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🗑️ Xóa Toàn Bộ Cache
                            </button>
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <p className="text-sm text-blue-800">
                                <strong>💡 Mẹo:</strong> Preload cache giúp website load cực nhanh cho khách hàng lần đầu truy cập.
                                Nên preload sau khi cập nhật sản phẩm hoặc thay đổi nội dung.
                            </p>
                        </div>
                    </div>

                    {/* Cache Entries Table */}
                    {stats.entries.length > 0 && (
                        <div className="glass-strong p-6 rounded-2xl border border-pink-200/50">
                            <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
                                📋 Chi Tiết Cache
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-pink-200">
                                            <th className="text-left py-3 px-4 font-bold text-gray-700">Key</th>
                                            <th className="text-right py-3 px-4 font-bold text-gray-700">Kích thước</th>
                                            <th className="text-right py-3 px-4 font-bold text-gray-700">Tuổi (phút)</th>
                                            <th className="text-right py-3 px-4 font-bold text-gray-700">Hits</th>
                                            <th className="text-right py-3 px-4 font-bold text-gray-700">TTL (giờ)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.entries.map((entry, index) => (
                                            <tr
                                                key={entry.key}
                                                className={`border-b border-gray-100 hover:bg-pink-50/30 ${index % 2 === 0 ? 'bg-white/50' : ''
                                                    }`}
                                            >
                                                <td className="py-3 px-4 font-mono text-xs">{entry.key}</td>
                                                <td className="py-3 px-4 text-right">{entry.sizeMB} MB</td>
                                                <td className="py-3 px-4 text-right">{entry.age}</td>
                                                <td className="py-3 px-4 text-right font-semibold text-green-600">
                                                    {entry.hits}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {(entry.ttl / (1000 * 60 * 60)).toFixed(1)}h
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CacheManagement;
