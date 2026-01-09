import React, { useEffect, useRef } from 'react';
import { FlowerProduct, CategorySettings, PaginationType } from '../types';
import FlowerCard from './FlowerCard';

interface CategorySectionProps {
    category: string;
    settings: CategorySettings;
    products: FlowerProduct[];
    currentPage: number;
    globalAspectRatio: string;
    mediaMetadata?: Record<string, { alt?: string, title?: string, description?: string }>;
    onLoadMore: () => void;
    onPageChange: (page: number) => void;
    onImageClick?: (
        images: { url: string; alt?: string; title?: string; variantId?: string }[],
        index: number,
        productInfo?: { title?: string; sku?: string; variants?: any[] }
    ) => void;
    showSKU?: boolean;
    zaloLink?: string;
    enablePriceDisplay?: boolean;
    onOrderClick?: (product: FlowerProduct) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
    category,
    settings,
    products,
    currentPage,
    globalAspectRatio,
    mediaMetadata,
    onLoadMore,
    onPageChange,
    onImageClick,
    showSKU,
    zaloLink,
    enablePriceDisplay,
    onOrderClick
}) => {
    const observerTarget = useRef<HTMLDivElement>(null);

    // Sort products by order
    const sortedProducts = [...products].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Pagination logic
    const itemsPerPage = settings.itemsPerPage;
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

    let displayProducts = sortedProducts;

    if (settings.paginationType === 'pagination') {
        // Traditional pagination: show only current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        displayProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);
    } else if (settings.paginationType === 'loadmore' || settings.paginationType === 'infinite') {
        // Load more / Infinite: show from start to current page
        displayProducts = sortedProducts.slice(0, currentPage * itemsPerPage);
    } else {
        // 'none': show limited items  
        displayProducts = sortedProducts.slice(0, itemsPerPage);
    }

    const hasMore = displayProducts.length < sortedProducts.length;
    const effectToUse = settings.imageTransition || 'fade';

    // Infinite scroll implementation
    useEffect(() => {
        if (settings.paginationType !== 'infinite') return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    onLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [settings.paginationType, hasMore, onLoadMore]);

    if (sortedProducts.length === 0) return null;

    return (
        <section id={category} className="mb-16 scroll-mt-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4 flex-grow">
                    <h3 className="text-2xl md:text-3xl font-bold gradient-text serif-display whitespace-nowrap">
                        {settings.displayName || category}
                    </h3>
                    <div className="h-[2px] bg-gradient-to-r from-pink-300 via-purple-300 to-transparent w-full" />
                </div>
                <span
                    className="ml-4 badge-glass bg-gradient-soft text-xs font-bold uppercase tracking-widest whitespace-nowrap"
                    style={{ color: 'var(--primary-pink)' }}
                >
                    {displayProducts.length} / {sortedProducts.length} mẫu
                </span>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {displayProducts.map((flower, index) => (
                    <FlowerCard
                        key={flower.id}
                        product={{
                            ...flower,
                            imageTransition: flower.imageTransition || effectToUse
                        }}
                        globalAspectRatio={globalAspectRatio}
                        categoryImageInterval={settings.imageInterval || 3000}
                        mediaMetadata={mediaMetadata}
                        onImageClick={onImageClick}
                        showSKU={showSKU}
                        zaloLink={zaloLink}
                        enablePriceDisplay={enablePriceDisplay}
                        onOrderClick={onOrderClick}
                        productIndex={index}
                    />
                ))}
            </div>

            {/* Load More Button */}
            {settings.paginationType === 'loadmore' && hasMore && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={onLoadMore}
                        className="pill-button bg-gradient-pink text-white px-8 py-4 text-sm font-bold shadow-xl hover-glow-pink"
                    >
                        ➕ Tải thêm sản phẩm
                    </button>
                </div>
            )}

            {/* Traditional Pagination */}
            {settings.paginationType === 'pagination' && totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8 flex-wrap">
                    {/* Previous Button */}
                    <button
                        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-xl font-bold transition-all ${currentPage === 1
                            ? 'opacity-50 cursor-not-allowed glass'
                            : 'glass hover:glass-strong'
                            }`}
                    >
                        ←
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                        // Show first, last, current, and adjacent pages
                        if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`w-12 h-12 rounded-xl font-bold transition-all ${currentPage === page
                                        ? 'bg-gradient-pink text-white shadow-lg glow-pink'
                                        : 'glass hover:glass-strong'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="px-2">...</span>;
                        }
                        return null;
                    })}

                    {/* Next Button */}
                    <button
                        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-xl font-bold transition-all ${currentPage === totalPages
                            ? 'opacity-50 cursor-not-allowed glass'
                            : 'glass hover:glass-strong'
                            }`}
                    >
                        →
                    </button>
                </div>
            )}

            {/* Infinite Scroll Observer Target */}
            {settings.paginationType === 'infinite' && hasMore && (
                <div ref={observerTarget} className="h-20 flex items-center justify-center mt-8">
                    <div className="spinner-glass"></div>
                </div>
            )}
        </section>
    );
};

export default CategorySection;
