import React from 'react';
import { ProductVariant } from '../types';

interface ProductVariantsEditorProps {
    variants?: ProductVariant[];
    productSKU?: string;
    onChange: (variants: ProductVariant[]) => void;
}

const ProductVariantsEditor: React.FC<ProductVariantsEditorProps> = ({
    variants = [],
    productSKU,
    onChange
}) => {
    const [isExpanded, setIsExpanded] = React.useState(true);
    const [newVariantName, setNewVariantName] = React.useState('');

    const handleAddVariant = () => {
        if (!newVariantName.trim()) {
            alert('⚠️ Vui lòng nhập tên biến thể!');
            return;
        }

        const newVariant: ProductVariant = {
            id: Date.now().toString(),
            name: newVariantName.trim(),
            sku: '' // Empty means using parent SKU
        };

        onChange([...variants, newVariant]);
        setNewVariantName('');
    };

    const handleDeleteVariant = (variantId: string) => {
        if (confirm('Xóa biến thể này?')) {
            onChange(variants.filter(v => v.id !== variantId));
        }
    };

    const handleUpdateVariant = (variantId: string, updates: Partial<ProductVariant>) => {
        onChange(variants.map(v =>
            v.id === variantId ? { ...v, ...updates } : v
        ));
    };

    return (
        <div className="glass p-6 rounded-2xl">
            <div
                className="flex justify-between items-center mb-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">🎨</span>
                    <label className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        Biến thể sản phẩm (Tùy chọn)
                    </label>
                </div>
                <button
                    type="button"
                    className="pill-button glass px-3 py-1"
                >
                    <svg
                        className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        style={{ color: 'var(--primary-pink)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {isExpanded && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        💡 Thêm các biến thể như màu sắc, kích thước... Mỗi biến thể có thể có SKU riêng hoặc dùng SKU sản phẩm mẹ.
                    </p>

                    {/* Add New Variant */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="glass-input flex-1 rounded-2xl px-4 py-2 text-sm"
                            placeholder="Nhập tên biến thể (vd: Màu Đỏ, Size L...)"
                            value={newVariantName}
                            onChange={(e) => setNewVariantName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddVariant();
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleAddVariant}
                            className="pill-button bg-gradient-pink text-white px-5 py-2 text-xs font-bold shadow-lg hover-glow-pink whitespace-nowrap"
                        >
                            + Thêm
                        </button>
                    </div>

                    {/* Variants List */}
                    {variants.length > 0 && (
                        <div className="space-y-3">
                            <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                                Danh sách biến thể ({variants.length})
                            </div>

                            {variants.map((variant, index) => (
                                <div
                                    key={variant.id}
                                    className="glass p-4 rounded-xl border border-white/30 space-y-3 animate-in slide-in-from-left-2 duration-300"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold" style={{ color: 'var(--primary-pink)' }}>
                                                #{index + 1}
                                            </span>
                                            <input
                                                type="text"
                                                className="glass-input rounded-xl px-3 py-2 text-sm font-semibold flex-1"
                                                value={variant.name}
                                                onChange={(e) => handleUpdateVariant(variant.id, { name: e.target.value })}
                                                placeholder="Tên biến thể"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteVariant(variant.id)}
                                            className="text-rose-500 hover:text-rose-700 transition-colors px-2"
                                            title="Xóa biến thể"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wide mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                                            Mã SKU riêng (để trống để dùng SKU sản phẩm mẹ)
                                        </label>
                                        <input
                                            type="text"
                                            className="glass-input w-full rounded-xl px-3 py-2 text-xs"
                                            value={variant.sku || ''}
                                            onChange={(e) => handleUpdateVariant(variant.id, { sku: e.target.value })}
                                            placeholder={productSKU || 'Chưa có SKU'}
                                        />
                                        {!variant.sku && productSKU && (
                                            <p className="text-[10px] mt-1 italic" style={{ color: 'var(--text-secondary)' }}>
                                                ✅ Đang dùng SKU sản phẩm mẹ: <span className="font-bold">{productSKU}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {variants.length === 0 && (
                        <div className="text-center py-8 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <p className="mb-2">📦 Chưa có biến thể nào</p>
                            <p className="text-[10px] opacity-70">Thêm biến thể để phân loại sản phẩm theo màu sắc, kích thước...</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductVariantsEditor;
