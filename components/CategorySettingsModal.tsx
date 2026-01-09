import React from 'react';
import { CategorySettings, PaginationType, ImageTransitionEffect } from '../types';

interface CategorySettingsModalProps {
    categoryName: string;
    settings: CategorySettings;
    onUpdate: (updates: Partial<CategorySettings>) => void;
    onClose: () => void;
    onRename: () => void; // Open rename modal
}

const IMAGE_TRANSITION_OPTIONS: { value: ImageTransitionEffect; label: string; group: string }[] = [
    { value: 'none', label: '❌ Không hiệu ứng', group: '⚡ Cơ bản' },
    { value: 'fade', label: 'Fade - Mờ dần', group: '🌊 Hiệu ứng cơ bản' },
    { value: 'slide-left', label: 'Slide Left - Trượt trái', group: '🌊 Hiệu ứng cơ bản' },
    { value: 'slide-right', label: 'Slide Right - Trượt phải', group: '🌊 Hiệu ứng cơ bản' },
    { value: 'slide-up', label: 'Slide Up - Trượt lên', group: '🌊 Hiệu ứng cơ bản' },
    { value: 'slide-down', label: 'Slide Down - Trượt xuống', group: '🌊 Hiệu ứng cơ bản' },
    { value: 'zoom-in', label: 'Zoom In - Phóng to', group: '🔍 Zoom' },
    { value: 'zoom-out', label: 'Zoom Out - Thu nhỏ', group: '🔍 Zoom' },
    { value: 'flip-horizontal', label: 'Flip Horizontal - Lật ngang', group: '🔄 Lật & Xoay' },
    { value: 'flip-vertical', label: 'Flip Vertical - Lật dọc', group: '🔄 Lật & Xoay' },
    { value: 'rotate-left', label: 'Rotate Left - Xoay trái', group: '🔄 Lật & Xoay' },
    { value: 'rotate-right', label: 'Rotate Right - Xoay phải', group: '🔄 Lật & Xoay' },
    { value: 'blur-fade', label: 'Blur Fade - Mờ ảnh', group: '🌀 Hiệu ứng đặc biệt' },
    { value: 'glitch', label: 'Glitch - Nhiễu', group: '🌀 Hiệu ứng đặc biệt' },
    { value: 'wipe-left', label: 'Wipe Left - Quét trái', group: '🎨 Wipe & Diagonal' },
    { value: 'wipe-right', label: 'Wipe Right - Quét phải', group: '🎨 Wipe & Diagonal' },
    { value: 'wipe-up', label: 'Wipe Up - Quét lên', group: '🎨 Wipe & Diagonal' },
    { value: 'wipe-down', label: 'Wipe Down - Quét xuống', group: '🎨 Wipe & Diagonal' },
    { value: 'diagonal-left', label: 'Diagonal Left - Chéo trái', group: '🎨 Wipe & Diagonal' },
    { value: 'diagonal-right', label: 'Diagonal Right - Chéo phải', group: '🎨 Wipe & Diagonal' },
    { value: 'cube-left', label: 'Cube Left - Lập phương trái', group: '🎪 3D Effects' },
    { value: 'cube-right', label: 'Cube Right - Lập phương phải', group: '🎪 3D Effects' },
    { value: 'bounce', label: 'Bounce - Nảy', group: '🎭 Animation' },
    { value: 'elastic', label: 'Elastic - Co giãn', group: '🎭 Animation' },
    { value: 'swing', label: 'Swing - Đung đưa', group: '🎭 Animation' },
];

const CategorySettingsModal: React.FC<CategorySettingsModalProps> = ({
    categoryName,
    settings,
    onUpdate,
    onClose,
    onRename
}) => {
    // Group options by category
    const groupedOptions = IMAGE_TRANSITION_OPTIONS.reduce((acc, option) => {
        if (!acc[option.group]) acc[option.group] = [];
        acc[option.group].push(option);
        return acc;
    }, {} as Record<string, typeof IMAGE_TRANSITION_OPTIONS>);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-neutral-100 px-8 py-6 flex items-center justify-between rounded-t-3xl z-10">
                    <div>
                        <h3 className="text-2xl font-bold serif flex items-center gap-2">
                            ⚙️ Cài đặt danh mục
                        </h3>
                        <p className="text-sm text-neutral-500 mt-1">
                            <strong>{settings.displayName || categoryName}</strong>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6">
                    {/* Rename Button */}
                    <div className="glass-gradient p-4 rounded-2xl border border-white/40">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                    ✏️ Tên hiển thị
                                </p>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    {settings.displayName || categoryName}
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRename();
                                }}
                                className="pill-button bg-gradient-pink text-white px-4 py-2 text-xs font-bold shadow-md hover-glow-pink"
                            >
                                Đổi tên
                            </button>
                        </div>
                    </div>

                    {/* Items Per Page */}
                    <div className="glass p-6 rounded-2xl">
                        <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            📊 Số lượng sản phẩm hiển thị
                        </label>
                        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                            Số sản phẩm hiển thị trên mỗi trang của danh mục này
                        </p>
                        <div className="flex gap-3 items-center">
                            <input
                                type="number"
                                min="4"
                                max="50"
                                step="4"
                                className="glass-input rounded-2xl px-4 py-3 text-sm font-semibold w-32"
                                value={settings.itemsPerPage}
                                onChange={(e) => onUpdate({ itemsPerPage: Number(e.target.value) })}
                            />
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                sản phẩm / trang
                            </span>
                        </div>
                    </div>

                    {/* Pagination Type */}
                    <div className="glass p-6 rounded-2xl">
                        <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            📄 Phương thức phân trang
                        </label>
                        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                            Cách người dùng xem thêm sản phẩm trong danh mục
                        </p>
                        <select
                            className="glass-input w-full rounded-2xl px-4 py-3 text-sm font-semibold"
                            value={settings.paginationType}
                            onChange={(e) => onUpdate({ paginationType: e.target.value as PaginationType })}
                        >
                            <option value="none">❌ Không phân trang (Hiển thị cố định)</option>
                            <option value="loadmore">➕ Nút "Tải thêm"</option>
                            <option value="infinite">♾️ Cuộn vô hạn (Infinite Scroll)</option>
                            <option value="pagination">📑 Phân trang truyền thống</option>
                        </select>
                    </div>

                    {/* Image Transition Effect */}
                    <div className="glass p-6 rounded-2xl">
                        <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            ✨ Hiệu ứng chuyển đổi ảnh
                        </label>
                        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                            Hiệu ứng mặc định khi ảnh sản phẩm chuyển đổi
                        </p>
                        <select
                            className="glass-input w-full rounded-2xl px-4 py-3 text-sm font-semibold"
                            value={settings.imageTransition || 'fade'}
                            onChange={(e) => onUpdate({ imageTransition: e.target.value as ImageTransitionEffect })}
                        >
                            {Object.entries(groupedOptions).map(([group, options]) => (
                                <optgroup key={group} label={group}>
                                    {options.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    {/* Image Interval (Speed) */}
                    <div className="glass p-6 rounded-2xl">
                        <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            ⏱️ Tốc độ chạy ảnh
                        </label>
                        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                            Thời gian hiển thị mỗi ảnh trước khi chuyển sang ảnh tiếp theo (áp dụng cho tất cả sản phẩm trong danh mục)
                        </p>
                        <div className="flex gap-3 items-center">
                            <input
                                type="number"
                                min="1000"
                                max="10000"
                                step="500"
                                className="glass-input rounded-2xl px-4 py-3 text-sm font-semibold w-32"
                                value={settings.imageInterval || 3000}
                                onChange={(e) => onUpdate({ imageInterval: Number(e.target.value) })}
                            />
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                ms (1000ms = 1 giây)
                            </span>
                        </div>
                        <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
                            💡 Khuyến nghị: 2000-4000ms để người xem có thời gian ngắm ảnh
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="glass-pink p-4 rounded-xl text-sm" style={{ color: 'var(--text-secondary)' }}>
                        💡 <span className="font-semibold">Lưu ý:</span> Tất cả thay đổi được lưu tự động và áp dụng ngay lập tức.
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-8 py-6 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-pink text-white px-6 py-4 rounded-2xl text-sm font-bold shadow-xl hover-glow-pink transition-all"
                    >
                        ✓ Hoàn tất
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategorySettingsModal;
