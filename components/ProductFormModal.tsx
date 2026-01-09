import React, { useState, useEffect } from 'react';
import { FlowerProduct, ProductVariant, ImageWithMetadata } from '../types';
import ProductVariantsEditor from './ProductVariantsEditor';

interface ProductFormModalProps {
    product?: FlowerProduct | null;
    categories: string[];
    onSave: (product: FlowerProduct) => void;
    onCancel: () => void;
    onDelete?: (productId: string) => void; // ← NEW: Delete callback
    onUploadImage?: (file: File) => Promise<string>;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
    product,
    categories,
    onSave,
    onCancel,
    onDelete,
    onUploadImage
}) => {
    const [formData, setFormData] = useState<Partial<FlowerProduct>>({
        title: '',
        sku: '',
        originalPrice: 0,
        salePrice: 0,
        category: categories[0] || '',
        categories: [],
        images: [],
        imagesWithMetadata: [],
        variants: [],
        ...product
    });

    const [uploadingImages, setUploadingImages] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !onUploadImage) return;

        setUploadingImages(true);
        const newImages: ImageWithMetadata[] = [];

        for (let i = 0; i < files.length; i++) {
            try {
                const url = await onUploadImage(files[i]);
                newImages.push({
                    url,
                    filename: files[i].name,
                    alt: formData.title || '',
                    title: formData.title || '',
                    variantId: '' // No variant selected by default
                });
            } catch (error) {
                console.error('Upload error:', error);
                alert(`❌ Lỗi upload ảnh: ${files[i].name}`);
            }
        }

        setFormData(prev => ({
            ...prev,
            imagesWithMetadata: [...(prev.imagesWithMetadata || []), ...newImages],
            images: [...(prev.images || []), ...newImages.map(img => img.url)]
        }));

        setUploadingImages(false);
        e.target.value = '';
    };

    const handleDeleteImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            imagesWithMetadata: prev.imagesWithMetadata?.filter((_, i) => i !== index),
            images: prev.images?.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateImageVariant = (index: number, variantId: string) => {
        setFormData(prev => {
            const updated = [...(prev.imagesWithMetadata || [])];
            if (updated[index]) {
                updated[index] = {
                    ...updated[index],
                    variantId: variantId  // Keep the value as-is, don't convert empty to undefined
                };
            }
            return {
                ...prev,
                imagesWithMetadata: updated
            };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title?.trim()) {
            alert('⚠️ Vui lòng nhập tên sản phẩm!');
            return;
        }

        if (!formData.category) {
            alert('⚠️ Vui lòng chọn ít nhất 1 danh mục!');
            return;
        }

        const productToSave: FlowerProduct = {
            id: formData.id || Date.now().toString(),
            title: formData.title.trim(),
            sku: formData.sku?.trim() || '',
            originalPrice: formData.originalPrice || 0,
            salePrice: formData.salePrice || 0,
            category: formData.category,
            categories: formData.categories || [],
            images: formData.images || [],
            imagesWithMetadata: formData.imagesWithMetadata || [],
            variants: formData.variants || [],
            order: formData.order
        };

        onSave(productToSave);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-strong rounded-3xl border border-white/30 shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/20 blur-backdrop">
                    <h2 className="text-2xl font-bold serif-display gradient-text">
                        {product?.id ? '✏️ Cập nhật sản phẩm' : '➕ Thêm sản phẩm mới'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="pill-button glass px-4 py-2 hover:glass-strong transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Product Name & SKU */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass p-4 rounded-2xl">
                            <label className="block text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Tên sản phẩm *
                            </label>
                            <input
                                type="text"
                                required
                                className="glass-input w-full rounded-xl px-4 py-3 text-sm font-semibold"
                                placeholder="Vd: Bó Hoa Hồng Đỏ"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>

                        <div className="glass p-4 rounded-2xl">
                            <label className="block text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Mã sản phẩm (SKU)
                            </label>
                            <input
                                type="text"
                                className="glass-input w-full rounded-xl px-4 py-3 text-sm font-semibold"
                                placeholder="Vd: ABC"
                                value={formData.sku}
                                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass p-4 rounded-2xl">
                            <label className="block text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Giá gốc (₫)
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="glass-input w-full rounded-xl px-4 py-3 text-sm font-semibold"
                                placeholder="20000"
                                value={formData.originalPrice || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: Number(e.target.value) }))}
                            />
                        </div>

                        <div className="glass p-4 rounded-2xl">
                            <label className="block text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Giá khuyến mãi (₫)
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="glass-input w-full rounded-xl px-4 py-3 text-sm font-semibold"
                                placeholder="10000"
                                value={formData.salePrice || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, salePrice: Number(e.target.value) }))}
                                style={{ color: 'var(--primary-pink)' }}
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="glass p-6 rounded-2xl">
                        <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            📁 Danh mục hiện tại (Chọn nhiều)
                        </label>
                        <p className="text-[10px] mb-4" style={{ color: 'var(--text-secondary)' }}>
                            💡 Sản phẩm sẽ xuất hiện ở tất cả các danh mục được chọn
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {categories.map(cat => (
                                <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.category === cat || formData.categories?.includes(cat)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                if (!formData.category) {
                                                    setFormData(prev => ({ ...prev, category: cat }));
                                                }
                                                setFormData(prev => ({
                                                    ...prev,
                                                    categories: [...(prev.categories || []), cat].filter((v, i, a) => a.indexOf(v) === i)
                                                }));
                                            } else {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    categories: prev.categories?.filter(c => c !== cat)
                                                }));
                                                if (formData.category === cat) {
                                                    setFormData(prev => ({ ...prev, category: formData.categories?.[0] || '' }));
                                                }
                                            }
                                        }}
                                        className="w-4 h-4 rounded border-neutral-300 text-pink-600 focus:ring-pink-500"
                                    />
                                    <span className="text-sm group-hover:text-[var(--primary-pink)] transition-colors">
                                        {cat}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Product Variants Editor */}
                    <ProductVariantsEditor
                        variants={formData.variants}
                        productSKU={formData.sku}
                        onChange={(variants) => setFormData(prev => ({ ...prev, variants }))}
                    />

                    {/* Images with Variant Selection */}
                    <div className="glass p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <label className="block text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                    📷 Hình ảnh sản phẩm (Tối đa 10 ảnh + SEO)
                                </label>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    Tải ảnh lên sẽ tự động lưu vào thư viện SEO của bạn. Chọn biến thể cho từng ảnh (nếu có).
                                </p>
                            </div>
                            <label className="pill-button bg-gradient-pink text-white px-5 py-2 text-xs font-bold shadow-lg hover-glow-pink cursor-pointer">
                                + Tải ảnh lên
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={uploadingImages}
                                />
                            </label>
                        </div>

                        {uploadingImages && (
                            <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Đang upload...</p>
                            </div>
                        )}

                        {formData.imagesWithMetadata && formData.imagesWithMetadata.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                                {formData.imagesWithMetadata.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <div className="aspect-square rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
                                            <img
                                                src={img.url}
                                                alt={img.alt || `Ảnh ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Variant Selector - REPLACED SEO Checkbox */}
                                        <div className="mt-2">
                                            <label className="text-[9px] font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-secondary)' }}>
                                                Biến thể
                                            </label>
                                            <select
                                                className="glass-input w-full rounded-lg px-2 py-1.5 text-[11px] font-semibold"
                                                value={img.variantId || ''}
                                                onChange={(e) => handleUpdateImageVariant(index, e.target.value)}
                                            >
                                                <option value="">-- Không có --</option>
                                                {formData.variants?.map(variant => (
                                                    <option key={variant.id} value={variant.id}>
                                                        {variant.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {img.variantId && (
                                                <p className="text-[9px] mt-1 italic text-green-600">
                                                    ✅ {formData.variants?.find(v => v.id === img.variantId)?.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImage(index)}
                                            className="absolute top-2 right-2 w-6 h-6 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 flex items-center justify-center shadow-lg"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>

                                        {/* Image Index */}
                                        <div className="absolute top-2 left-2 bg-neutral-900/70 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                            Ảnh {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-2xl mt-4">
                                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm text-neutral-400">Chưa có ảnh nào. Nhấn "Tải ảnh lên" để thêm ảnh.</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-between pt-4 border-t border-white/20">
                        {/* Delete Button - Only show for existing products */}
                        {product?.id && onDelete && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm(`⚠️ Bạn có chắc chắn muốn xóa sản phẩm "${product.title}"?\n\nHành động này không thể hoàn tác!`)) {
                                        onDelete(product.id);
                                    }
                                }}
                                className="pill-button bg-rose-500 text-white px-6 py-3 text-sm font-bold shadow-xl hover:bg-rose-600 transition-all"
                            >
                                🗑️ XÓA SẢN PHẨM
                            </button>
                        )}

                        {/* Right side buttons */}
                        <div className="flex gap-3 ml-auto">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="pill-button glass text-sm px-6 py-3 font-bold hover:glass-strong"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                className="pill-button bg-gradient-pink text-white px-8 py-3 text-sm font-bold shadow-xl hover-glow-pink"
                            >
                                {product?.id ? 'Lưu thông tin' : 'Thêm sản phẩm'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
