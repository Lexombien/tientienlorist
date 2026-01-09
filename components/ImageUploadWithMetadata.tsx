import React, { useState } from 'react';
import { ImageWithMetadata } from '../types';
import ImageMetadataModal from './ImageMetadataModal';

interface ImageUploadWithMetadataProps {
    image: ImageWithMetadata | null;
    index: number;
    onUpdate: (image: ImageWithMetadata | null) => void;
}

// Thay localhost bằng IP LAN để truy cập từ máy khác
// Auto-detect backend URL based on environment
const isDevelopment = window.location.hostname === 'localhost' ||
    window.location.hostname.match(/^192\.168\./) ||
    window.location.hostname.match(/^10\./) ||
    window.location.hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./);

const BACKEND_URL = isDevelopment
    ? `http://${window.location.hostname}:3001`
    : '';

const ImageUploadWithMetadata: React.FC<ImageUploadWithMetadataProps> = ({
    image,
    index,
    onUpdate
}) => {
    const [showMetadataModal, setShowMetadataModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh!');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước ảnh không được vượt quá 5MB!');
            return;
        }

        setUploading(true);

        try {
            // Create FormData
            const formData = new FormData();
            formData.append('image', file);

            // Upload to backend
            const response = await fetch(`${BACKEND_URL}/api/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();

            if (data.success) {
                // Update with server URL
                onUpdate({
                    url: data.url,
                    filename: data.filename,
                    alt: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for default alt
                    title: file.name.replace(/\.[^/.]+$/, ''),
                    description: ''
                });
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Lỗi upload ảnh! Vui lòng kiểm tra backend server đang chạy.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        // Cập nhật UI ngay lập tức để người dùng thấy ảnh biến mất
        onUpdate(null);

        // Xử lý xóa file ở background (không await để tránh đơ UI)
        if (image && image.url.startsWith(BACKEND_URL) && image.filename) {
            fetch(`${BACKEND_URL}/api/upload/${image.filename}`, {
                method: 'DELETE'
            }).catch(err => console.error('Background delete error:', err));
        }
    };

    const handleMetadataUpdate = (updates: Partial<ImageWithMetadata>) => {
        if (!image) return;
        onUpdate({
            ...image,
            ...updates
        });
    };

    return (
        <>
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                    {image?.url ? (
                        <div className="space-y-2">
                            {/* Preview Image */}
                            <div className="relative group rounded-xl overflow-hidden border-2 border-neutral-200">
                                <img
                                    src={image.url}
                                    alt={image.alt || `Ảnh ${index + 1}`}
                                    className="w-full aspect-square object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <label
                                        className="cursor-pointer bg-white/90 hover:bg-white text-neutral-700 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        🔄 Thay đổi
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </label>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Bạn chắc chắn muốn xóa ảnh này?')) {
                                                handleRemove();
                                            }
                                        }}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all"
                                    >
                                        🗑️ Xóa
                                    </button>
                                </div>
                            </div>

                            {/* SEO Status Indicator */}
                            {image.alt || image.title || image.description ? (
                                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                                    <span className="text-xs text-green-700">✓ Đã có SEO</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <span className="text-xs text-yellow-700">⚠️ Chưa có SEO</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <label className="cursor-pointer">
                            <div className="border-2 border-dashed border-neutral-300 rounded-xl aspect-square flex flex-col items-center justify-center hover:border-pink-400 hover:bg-pink-50/50 transition-all">
                                {uploading ? (
                                    <>
                                        <div className="spinner-glass mb-2"></div>
                                        <p className="text-xs font-bold text-neutral-400">Đang upload...</p>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-12 h-12 text-neutral-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-xs font-bold text-neutral-400">+ Tải ảnh lên</p>
                                        <p className="text-[10px] text-neutral-300 mt-1">Ảnh {index + 1}</p>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                        </label>
                    )}
                </div>
            </div>

            {/* SEO Metadata Modal */}
            {showMetadataModal && image && (
                <ImageMetadataModal
                    image={image}
                    index={index}
                    onUpdate={handleMetadataUpdate}
                    onClose={() => setShowMetadataModal(false)}
                />
            )}
        </>
    );
};

export default ImageUploadWithMetadata;
