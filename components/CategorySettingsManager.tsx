import React from 'react';
import { CategorySettings, PaginationType, ImageTransitionEffect } from '../types';

interface CategorySettingsManagerProps {
    categories: string[];
    categorySettings: Record<string, CategorySettings>;
    updateCategorySettings: (categoryName: string, updates: Partial<CategorySettings>) => void;
    openCategoryEditModal: (categoryName: string) => void;
    expanded: boolean;
    onToggle: () => void;
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

const CategorySettingsManager: React.FC<CategorySettingsManagerProps> = ({
    categories,
    categorySettings,
    updateCategorySettings,
    openCategoryEditModal,
    expanded,
    onToggle
}) => {
    // Group options by category
    const groupedOptions = IMAGE_TRANSITION_OPTIONS.reduce((acc, option) => {
        if (!acc[option.group]) acc[option.group] = [];
        acc[option.group].push(option);
        return acc;
    }, {} as Record<string, typeof IMAGE_TRANSITION_OPTIONS>);

    return (
        <section className="glass-strong p-8 rounded-3xl border border-white/30 shadow-xl">
            <div
                className="flex justify-between items-center mb-6 cursor-pointer group"
                onClick={onToggle}
            >
                <h3 className="text-lg font-bold serif-display gradient-text flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-gradient-purple rounded-full inline-block"></span>
                    Cài đặt Danh mục ⚙️
                </h3>
                <button className="pill-button glass px-4 py-2 hover:glass-strong transition-all">
                    <svg
                        className={`w-5 h-5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                        style={{ color: 'var(--primary-pink)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {expanded && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {categories.map(category => {
                        const settings = categorySettings[category] || {
                            name: category,
                            itemsPerPage: 8,
                            paginationType: 'none' as PaginationType,
                            imageTransition: 'fade' as ImageTransitionEffect
                        };

                        return (
                            <div key={category} className="glass p-6 rounded-2xl space-y-4">
                                {/* Category Name with Edit */}
                                <div className="flex items-center gap-4">
                                    <h4 className="font-bold text-lg flex-grow" style={{ color: 'var(--text-primary)' }}>
                                        {settings.displayName || category}
                                    </h4>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openCategoryEditModal(category);
                                        }}
                                        className="pill-button bg-gradient-pink text-white px-4 py-2 text-xs font-bold shadow-md hover-glow-pink"
                                    >
                                        ✏️ Sửa tên
                                    </button>
                                </div>

                                {/* Items Per Page */}
                                <div>
                                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                        📊 Số lượng sản phẩm hiển thị
                                    </label>
                                    <div className="flex gap-3 items-center">
                                        <input
                                            type="number"
                                            min="4"
                                            max="50"
                                            step="4"
                                            className="glass-input rounded-2xl px-4 py-2 text-sm font-semibold w-32"
                                            value={settings.itemsPerPage}
                                            onChange={(e) => updateCategorySettings(category, {
                                                itemsPerPage: Number(e.target.value)
                                            })}
                                        />
                                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            sản phẩm
                                        </span>
                                    </div>
                                </div>

                                {/* Pagination Type */}
                                <div>
                                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                        📄 Phương thức phân trang
                                    </label>
                                    <select
                                        className="glass-input w-full rounded-2xl px-4 py-3 text-sm font-semibold"
                                        value={settings.paginationType}
                                        onChange={(e) => updateCategorySettings(category, {
                                            paginationType: e.target.value as PaginationType
                                        })}
                                    >
                                        <option value="none">❌ Không phân trang (Hiển thị cố định)</option>
                                        <option value="loadmore">➕ Nút "Tải thêm"</option>
                                        <option value="infinite">♾️ Cuộn vô hạn (Infinite Scroll)</option>
                                        <option value="pagination">📑 Phân trang truyền thống</option>
                                    </select>
                                </div>

                                {/* Image Transition Effect */}
                                <div>
                                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                        ✨ Hiệu ứng chuyển đổi ảnh
                                    </label>
                                    <select
                                        className="glass-input w-full rounded-2xl px-4 py-3 text-sm font-semibold"
                                        value={settings.imageTransition || 'fade'}
                                        onChange={(e) => updateCategorySettings(category, {
                                            imageTransition: e.target.value as ImageTransitionEffect
                                        })}
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
                            </div>
                        );
                    })}

                    {categories.length === 0 && (
                        <div className="text-center py-8 text-neutral-400 text-sm">
                            <p>Chưa có danh mục nào để cấu hình.</p>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default CategorySettingsManager;
