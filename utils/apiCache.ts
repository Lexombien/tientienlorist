// API Cache Utility for better performance
// Cache API responses in localStorage with expiration

const CACHE_PREFIX = 'api_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export interface CacheItem<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

export const apiCache = {
    // Set cache with TTL
    set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
        try {
            const cacheItem: CacheItem<T> = {
                data,
                timestamp: Date.now(),
                ttl
            };
            localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheItem));
        } catch (error) {
            console.warn('Cache set failed:', error);
        }
    },

    // Get cache if not expired
    get<T>(key: string): T | null {
        try {
            const cached = localStorage.getItem(CACHE_PREFIX + key);
            if (!cached) return null;

            const cacheItem: CacheItem<T> = JSON.parse(cached);
            const now = Date.now();

            // Check if expired
            if (now - cacheItem.timestamp > cacheItem.ttl) {
                this.delete(key);
                return null;
            }

            return cacheItem.data;
        } catch (error) {
            console.warn('Cache get failed:', error);
            return null;
        }
    },

    // Delete specific cache
    delete(key: string): void {
        localStorage.removeItem(CACHE_PREFIX + key);
    },

    // Clear all API caches
    clearAll(): void {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    },

    // Clear expired caches
    clearExpired(): void {
        const keys = Object.keys(localStorage);
        const now = Date.now();

        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                try {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const cacheItem = JSON.parse(cached);
                        if (now - cacheItem.timestamp > cacheItem.ttl) {
                            localStorage.removeItem(key);
                        }
                    }
                } catch (error) {
                    // Invalid cache item, remove it
                    localStorage.removeItem(key);
                }
            }
        });
    }
};

// Cached fetch wrapper
export async function cachedFetch<T>(
    url: string,
    options?: RequestInit,
    ttl?: number
): Promise<T> {
    const cacheKey = url + JSON.stringify(options || {});

    // Try to get from cache first (only for GET requests)
    if (!options || options.method === 'GET' || !options.method) {
        const cached = apiCache.get<T>(cacheKey);
        if (cached) {
            console.log('✅ Cache hit:', url);
            return cached;
        }
    }

    // Fetch from network
    console.log('🌐 Cache miss, fetching:', url);
    const response = await fetch(url, options);
    const data = await response.json();

    // Cache the result (only for successful GET requests)
    if (response.ok && (!options || options.method === 'GET' || !options.method)) {
        apiCache.set(cacheKey, data, ttl);
    }

    return data;
}

// Clear expired caches on load
apiCache.clearExpired();
