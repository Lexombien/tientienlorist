import React from 'react';
import { ImageWithMetadata } from '../types';

interface ImageMetadataModalProps {
    image: ImageWithMetadata;
    index: number;
    onUpdate: (updates: Partial<ImageWithMetadata>) => void;
    onClose: () => void;
}

const ImageMetadataModal: React.FC<ImageMetadataModalProps> = ({
    image,
    index,
    onUpdate,
    onClose
}) => {
    const handleUpdate = (field: keyof ImageWithMetadata, value: string) => {
        onUpdate({ [field]: value });
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
                // Only close if clicking directly on backdrop
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-neutral-100 px-8 py-6 flex items-center justify-between rounded-t-3xl z-10">
                    <div>
                        <h3 className="text-2xl font-bold serif flex items-center gap-2">
                            📊 Cài đặt SEO cho ảnh {index + 1}
                        </h3>
                        <p className="text-sm text-neutral-500 mt-1">
                            Tối ưu hóa ảnh cho Google Images
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
                    {/* Image Preview */}
                    <div className="flex justify-center">
                        <img
                            src={image.url}
                            alt={image.alt || `Ảnh ${index + 1}`}
                            className="max-w-full max-h-64 rounded-xl shadow-lg object-contain"
                        />
                    </div>

                    {/* Filename */}
                    <div className="glass p-6 rounded-2xl">
                        <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            📁 Tên file (cho URL)
                        </label>
                        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                            URL thân thiện SEO, dùng dấu gạch ngang thay vì khoảng trắng
                        </p>
                        <input
                            type="text"
                            value={image.filename || ''}
                            onChange={(e) => handleUpdate('filename', e.target.value)}
                            placeholder="vd: bo-hoa-hong-do-20-bong.jpg"
                            className="glass-input w-full rounded-2xl px-4 py-3 text-sm font-semibold"
                        />
                    </div>

                    {/* Alt Text */}
                    <div className="glass p-6 rounded-2xl">
                        <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            🏷️ Alt Text (mô tả ngắn)
                        </label>
                        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                            <strong>Quan trọng nhất!</strong> Hiển thị khi ảnh không load được. Google dùng để hiểu nội dung ảnh.
                        </p>
                        <input
                            type="text"
                            value={image.alt || ''}
                            onChange={(e) => handleUpdate('alt', e.target.value)}
                            placeholder="vd: Bó hoa hồng đỏ 20 bông tươi đẹp"
                            className="glass-input w-full rounded-2xl px-4 py-3 text-sm font-semibold"
                        />
                        <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
                            💡 Mô tả chính xác, ngắn gọn, có từ khóa quan trọng
                        </p>
                    </div>

                    {/* Title */}
                    <div className="glass p-6 rounded-2xl">
                        <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            ✨ Title (hiển thị khi hover)
                        </label>
                        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                            Hiển thị khi người dùng di chuột qua ảnh
                        </p>
                        <input
                            type="text"
                            value={image.title || ''}
                            onChange={(e) => handleUpdate('title', e.target.value)}
                            placeholder="vd: Hoa hồng đỏ tươi giá rẻ - Giao nhanh TPHCM"
                            className="glass-input w-full rounded-2xl px-4 py-3 text-sm font-semibold"
                        />
                    </div>

                    {/* Description */}
                    <div className="glass p-6 rounded-2xl">
                        <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            📝 Mô tả chi tiết (cho metadata)
                        </label>
                        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                            Thông tin đầy đủ về sản phẩm, giá, ưu đãi, khu vực giao hàng
                        </p>
                        <textarea
                            value={image.description || ''}
                            onChange={(e) => handleUpdate('description', e.target.value)}
                            placeholder="vd: Bó hoa hồng đỏ Ecuador cao cấp 20 bông, tươi mới trong ngày, giá ưu đãi chỉ 450K. Miễn phí giao hàng nội thành TPHCM. Cam kết hoa tươi 100%."
                            className="glass-input w-full rounded-2xl px-4 py-3 text-sm resize-none"
                            rows={4}
                        />
                    </div>

                    {/* Tips */}
                    <div className="glass-pink p-4 rounded-xl text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <p className="font-semibold mb-2">💡 Tips tối ưu SEO:</p>
                        <ul className="space-y-1 text-xs ml-4">
                            <li>• Dùng từ khóa chính trong Alt Text (VD: "hoa hồng đỏ", "bó hoa sinh nhật")</li>
                            <li>• Mô tả chính xác nội dung ảnh, không lạm dụng từ khóa</li>
                            <li>• Thêm địa điểm nếu phù hợp (VD: "TPHCM", "Hà Nội")</li>
                            <li>• Tên file dùng dấu gạch ngang (-) thay vì khoảng trắng hoặc underscore</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-8 py-6 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-pink text-white px-6 py-4 rounded-2xl text-sm font-bold shadow-xl hover-glow-pink transition-all"
                    >
                        ✓ Lưu & Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageMetadataModal;
