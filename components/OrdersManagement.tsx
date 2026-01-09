import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';

const OrdersManagement: React.FC = () => {
    // State
    const [orders, setOrders] = useState<Order[]>([]);
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load orders on mount
    useEffect(() => {
        loadOrders();
    }, []);

    // API Functions
    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/orders');
            const data = await response.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            if (data.success) {
                loadOrders();
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(data.order);
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const deleteOrder = async (orderId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;

        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                loadOrders();
                setShowDetailModal(false);
            }
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    const updateAdminNotes = async (orderId: string, adminNotes: string) => {
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNotes })
            });
        } catch (error) {
            console.error('Error updating notes:', error);
        }
    };

    // Helper Functions  
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: OrderStatus) => {
        const colors: Record<OrderStatus, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status: OrderStatus) => {
        const labels: Record<OrderStatus, string> = {
            pending: '⏳ Chờ xử lý',
            processing: '🔄 Đang xử lý',
            completed: '✅ Hoàn thành',
            cancelled: '❌ Đã hủy'
        };
        return labels[status] || status;
    };

    // Computed values
    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    return (
        <div className="space-y-6">
            {/* Stats Header */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { key: 'all' as const, count: stats.total, label: 'Tổng đơn', color: 'pink' },
                    { key: 'pending' as const, count: stats.pending, label: 'Chờ xử lý', color: 'yellow' },
                    { key: 'processing' as const, count: stats.processing, label: 'Đang xử lý', color: 'blue' },
                    { key: 'completed' as const, count: stats.completed, label: 'Hoàn thành', color: 'green' },
                    { key: 'cancelled' as const, count: stats.cancelled, label: 'Đã hủy', color: 'red' }
                ].map(stat => (
                    <div
                        key={stat.key}
                        className={`glass p-4 rounded-2xl cursor-pointer transition-all ${filterStatus === stat.key ? `ring-2 ring-${stat.color}-500` : ''}`}
                        onClick={() => setFilterStatus(stat.key as any)}
                    >
                        <div className={`text-2xl font-bold ${stat.key === 'all' ? 'gradient-text' : `text-${stat.color}-600`}`}>
                            {stat.count}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Orders Table */}
            <div className="glass rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/20">
                    <h2 className="text-2xl font-bold serif-display gradient-text">
                        📦 Danh sách đơn hàng
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                        <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Đang tải...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <p style={{ color: 'var(--text-secondary)' }}>Chưa có đơn hàng nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    {['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Giá', 'Trạng thái', 'Ngày đặt', 'Hành động'].map(header => (
                                        <th key={header} className="text-left p-4 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr
                                        key={order.id}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setShowDetailModal(true);
                                        }}
                                    >
                                        <td className="p-4">
                                            <div className="font-bold text-pink-600">{order.orderNumber}</div>
                                            {order.isGift && <div className="text-xs text-purple-600">🎁 Quà tặng</div>}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold">{order.customerName}</div>
                                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{order.customerPhone}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium">{order.productName}</div>
                                            {order.variantName && (
                                                <div className="text-xs text-blue-600">🎨 {order.variantName}</div>
                                            )}
                                        </td>
                                        <td className="p-4 font-semibold">{formatPrice(order.productPrice)}</td>
                                        <td className="p-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    updateOrderStatus(order.id, e.target.value as OrderStatus);
                                                }}
                                                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${getStatusColor(order.status)}`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="pending">⏳ Chờ xử lý</option>
                                                <option value="processing">🔄 Đang xử lý</option>
                                                <option value="completed">✅ Hoàn thành</option>
                                                <option value="cancelled">❌ Đã hủy</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => deleteOrder(order.id)}
                                                className="pill-button bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 text-xs"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal - Simplified version due to length */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}>
                    <div className="glass-strong rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/20">
                            <h2 className="text-2xl font-bold serif-display gradient-text">
                                Chi tiết {selectedOrder.orderNumber}
                            </h2>
                            <button onClick={() => setShowDetailModal(false)} className="pill-button glass px-4 py-2">✕</button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Status Selector */}
                            <div className="glass p-4 rounded-2xl">
                                <label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-secondary)' }}>Trạng thái</label>
                                <select
                                    value={selectedOrder.status}
                                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                                    className={`w-full px-4 py-3 rounded-xl font-bold cursor-pointer ${getStatusColor(selectedOrder.status)}`}
                                >
                                    <option value="pending">⏳ Chờ xử lý</option>
                                    <option value="processing">🔄 Đang xử lý</option>
                                    <option value="completed">✅ Hoàn thành</option>
                                    <option value="cancelled">❌ Đã hủy</option>
                                </select>
                            </div>

                            {/* Customer Info */}
                            <div className="glass p-4 rounded-2xl">
                                <h3 className="font-bold mb-3">👤 Người nhận</h3>
                                <div className="space-y-1 text-sm">
                                    <div><strong>Tên:</strong> {selectedOrder.customerName}</div>
                                    <div><strong>SĐT:</strong> {selectedOrder.customerPhone}</div>
                                    <div><strong>Địa chỉ:</strong> {selectedOrder.customerAddress}</div>
                                </div>
                            </div>

                            {/* Gift Info */}
                            {selectedOrder.isGift && selectedOrder.senderName && (
                                <div className="glass p-4 rounded-2xl bg-purple-50/50">
                                    <h3 className="font-bold mb-3">🎁 Người tặng</h3>
                                    <div className="space-y-1 text-sm">
                                        <div><strong>Tên:</strong> {selectedOrder.senderName}</div>
                                        <div><strong>SĐT:</strong> {selectedOrder.senderPhone}</div>
                                    </div>
                                </div>
                            )}

                            {/* Product Info */}
                            <div className="glass p-4 rounded-2xl">
                                <h3 className="font-bold mb-3">📦 Sản phẩm</h3>
                                <div className="space-y-1 text-sm">
                                    <div><strong>Tên:</strong> {selectedOrder.productName}</div>
                                    {selectedOrder.variantName && <div><strong>Biến thể:</strong> {selectedOrder.variantName}</div>}
                                    {selectedOrder.variantSKU && <div><strong>SKU:</strong> {selectedOrder.variantSKU}</div>}
                                    <div className="text-lg font-bold gradient-text mt-2">{formatPrice(selectedOrder.productPrice)}</div>
                                </div>
                            </div>

                            {/* Customer Note */}
                            {selectedOrder.note && (
                                <div className="glass p-4 rounded-2xl">
                                    <h3 className="font-bold mb-2">📝 Ghi chú khách</h3>
                                    <p className="text-sm italic">{selectedOrder.note}</p>
                                </div>
                            )}

                            {/* Admin Notes */}
                            <div className="glass p-4 rounded-2xl">
                                <h3 className="font-bold mb-2">📋 Ghi chú nội bộ</h3>
                                <textarea
                                    className="glass-input w-full rounded-xl px-4 py-3 text-sm"
                                    placeholder="Ghi chú của admin..."
                                    defaultValue={selectedOrder.adminNotes || ''}
                                    onBlur={(e) => updateAdminNotes(selectedOrder.id, e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* Meta */}
                            <div className="text-xs p-3 rounded-xl" style={{ color: 'var(--text-secondary)', background: 'var(--glass-bg)' }}>
                                <div>Ngày đặt: {formatDate(selectedOrder.createdAt)}</div>
                                <div>ID: {selectedOrder.id}</div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => deleteOrder(selectedOrder.id)}
                                    className="pill-button bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 font-bold flex-1"
                                >
                                    🗑️ Xóa
                                </button>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="pill-button glass px-6 py-3 font-bold flex-1"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersManagement;
