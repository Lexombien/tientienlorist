import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    onClick?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className = '', onClick }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px', // Load 50px before entering viewport
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div className={`relative ${className}`} onClick={onClick}>
            {/* Placeholder/skeleton */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
            )}

            {/* Actual image */}
            {isInView && (
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onLoad={() => setIsLoaded(true)}
                    loading="lazy"
                />
            )}
        </div>
    );
};

export default LazyImage;
