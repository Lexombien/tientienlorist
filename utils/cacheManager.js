import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache storage directory
const CACHE_DIR = path.join(__dirname, '../.cache');
const CACHE_INDEX_FILE = path.join(CACHE_DIR, 'index.json');
const MAX_CACHE_SIZE_MB = 500; // 500MB max cache size
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours default TTL

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Initialize cache index
if (!fs.existsSync(CACHE_INDEX_FILE)) {
    fs.writeFileSync(CACHE_INDEX_FILE, JSON.stringify({
        entries: {},
        stats: {
            totalSize: 0,
            totalHits: 0,
            totalMisses: 0,
            createdAt: Date.now(),
            lastPreload: null
        }
    }, null, 2));
}

/**
 * Get cache index
 */
function getCacheIndex() {
    try {
        return JSON.parse(fs.readFileSync(CACHE_INDEX_FILE, 'utf8'));
    } catch (e) {
        console.error('Failed to read cache index:', e);
        return {
            entries: {},
            stats: {
                totalSize: 0,
                totalHits: 0,
                totalMisses: 0,
                createdAt: Date.now(),
                lastPreload: null
            }
        };
    }
}

/**
 * Save cache index
 */
function saveCacheIndex(index) {
    fs.writeFileSync(CACHE_INDEX_FILE, JSON.stringify(index, null, 2));
}

/**
 * Generate cache key from request
 */
function generateCacheKey(req) {
    const url = req.originalUrl || req.url;
    const method = req.method;
    return `${method}_${url.replace(/[^a-z0-9]/gi, '_')}`;
}

/**
 * Get cached response
 */
export function getCache(key) {
    try {
        const index = getCacheIndex();
        const entry = index.entries[key];

        if (!entry) {
            index.stats.totalMisses++;
            saveCacheIndex(index);
            return null;
        }

        // Check if cache is expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            deleteCache(key);
            index.stats.totalMisses++;
            saveCacheIndex(index);
            return null;
        }

        // Read cache file
        const cacheFile = path.join(CACHE_DIR, `${key}.json`);
        if (!fs.existsSync(cacheFile)) {
            delete index.entries[key];
            saveCacheIndex(index);
            index.stats.totalMisses++;
            return null;
        }

        const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));

        // Update stats
        index.stats.totalHits++;
        entry.hits++;
        entry.lastAccess = Date.now();
        saveCacheIndex(index);

        console.log(`✅ CACHE HIT: ${key}`);
        return data;
    } catch (e) {
        console.error('Cache read error:', e);
        return null;
    }
}

/**
 * Save response to cache
 */
export function setCache(key, data, ttl = CACHE_TTL_MS) {
    try {
        const index = getCacheIndex();
        const cacheFile = path.join(CACHE_DIR, `${key}.json`);
        const content = JSON.stringify(data);
        const size = Buffer.byteLength(content, 'utf8');

        // Check cache size limit
        if (index.stats.totalSize + size > MAX_CACHE_SIZE_MB * 1024 * 1024) {
            evictOldestCache();
        }

        // Write cache file
        fs.writeFileSync(cacheFile, content);

        // Update index
        index.entries[key] = {
            key,
            size,
            timestamp: Date.now(),
            lastAccess: Date.now(),
            ttl,
            hits: 0
        };
        index.stats.totalSize += size;
        saveCacheIndex(index);

        console.log(`💾 CACHE SAVED: ${key} (${(size / 1024).toFixed(2)} KB)`);
    } catch (e) {
        console.error('Cache write error:', e);
    }
}

/**
 * Delete specific cache entry
 */
export function deleteCache(key) {
    try {
        const index = getCacheIndex();
        const entry = index.entries[key];

        if (entry) {
            const cacheFile = path.join(CACHE_DIR, `${key}.json`);
            if (fs.existsSync(cacheFile)) {
                fs.unlinkSync(cacheFile);
            }
            index.stats.totalSize -= entry.size;
            delete index.entries[key];
            saveCacheIndex(index);
            console.log(`🗑️ CACHE DELETED: ${key}`);
        }
    } catch (e) {
        console.error('Cache delete error:', e);
    }
}

/**
 * Clear all cache
 */
export function clearAllCache() {
    try {
        const index = getCacheIndex();

        // Delete all cache files
        Object.keys(index.entries).forEach(key => {
            const cacheFile = path.join(CACHE_DIR, `${key}.json`);
            if (fs.existsSync(cacheFile)) {
                fs.unlinkSync(cacheFile);
            }
        });

        // Reset index
        index.entries = {};
        index.stats.totalSize = 0;
        saveCacheIndex(index);

        console.log('🧹 ALL CACHE CLEARED');
        return { success: true, message: 'All cache cleared successfully' };
    } catch (e) {
        console.error('Clear cache error:', e);
        return { success: false, error: e.message };
    }
}

/**
 * Evict oldest cache entries
 */
function evictOldestCache() {
    try {
        const index = getCacheIndex();
        const entries = Object.values(index.entries);

        // Sort by last access (oldest first)
        entries.sort((a, b) => a.lastAccess - b.lastAccess);

        // Remove oldest 20%
        const toRemove = Math.ceil(entries.length * 0.2);
        for (let i = 0; i < toRemove; i++) {
            deleteCache(entries[i].key);
        }

        console.log(`🗑️ Evicted ${toRemove} oldest cache entries`);
    } catch (e) {
        console.error('Eviction error:', e);
    }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
    try {
        const index = getCacheIndex();
        const entryCount = Object.keys(index.entries).length;
        const sizeMB = (index.stats.totalSize / (1024 * 1024)).toFixed(2);
        const hitRate = index.stats.totalHits + index.stats.totalMisses > 0
            ? ((index.stats.totalHits / (index.stats.totalHits + index.stats.totalMisses)) * 100).toFixed(2)
            : 0;

        return {
            success: true,
            stats: {
                entryCount,
                totalSizeMB: parseFloat(sizeMB),
                maxSizeMB: MAX_CACHE_SIZE_MB,
                usagePercent: ((sizeMB / MAX_CACHE_SIZE_MB) * 100).toFixed(2),
                totalHits: index.stats.totalHits,
                totalMisses: index.stats.totalMisses,
                hitRate: parseFloat(hitRate),
                createdAt: index.stats.createdAt,
                lastPreload: index.stats.lastPreload,
                entries: Object.values(index.entries).map(e => ({
                    key: e.key,
                    sizeMB: (e.size / (1024 * 1024)).toFixed(4),
                    age: Math.floor((Date.now() - e.timestamp) / 1000 / 60), // minutes
                    hits: e.hits,
                    ttl: e.ttl
                }))
            }
        };
    } catch (e) {
        console.error('Get stats error:', e);
        return { success: false, error: e.message };
    }
}

/**
 * Preload cache - Generate cache for all critical pages
 */
export async function preloadCache(baseURL, endpoints = []) {
    try {
        console.log('🚀 Starting cache preload...');
        const results = [];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${baseURL}${endpoint}`);
                const data = await response.text();
                const key = `GET_${endpoint.replace(/[^a-z0-9]/gi, '_')}`;

                setCache(key, { body: data, headers: Object.fromEntries(response.headers.entries()) });
                results.push({ endpoint, success: true });
                console.log(`✅ Preloaded: ${endpoint}`);
            } catch (e) {
                results.push({ endpoint, success: false, error: e.message });
                console.error(`❌ Failed to preload: ${endpoint}`, e.message);
            }
        }

        // Update last preload time
        const index = getCacheIndex();
        index.stats.lastPreload = Date.now();
        saveCacheIndex(index);

        console.log('✅ Cache preload completed');
        return { success: true, results };
    } catch (e) {
        console.error('Preload error:', e);
        return { success: false, error: e.message };
    }
}

/**
 * Cache middleware for Express
 */
export function cacheMiddleware(options = {}) {
    const { ttl = CACHE_TTL_MS, exclude = [], include = [] } = options;

    return (req, res, next) => {
        // Skip non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Check exclusions
        if (exclude.some(pattern => req.path.includes(pattern))) {
            return next();
        }

        // Check inclusions (if specified)
        if (include.length > 0 && !include.some(pattern => req.path.includes(pattern))) {
            return next();
        }

        const key = generateCacheKey(req);
        const cached = getCache(key);

        if (cached) {
            // Serve from cache
            if (cached.headers) {
                Object.entries(cached.headers).forEach(([k, v]) => {
                    res.set(k, v);
                });
            }
            res.set('X-Cache', 'HIT');
            return res.send(cached.body);
        }

        // Cache miss - intercept response
        const originalSend = res.send;
        res.send = function (body) {
            // Only cache successful responses
            if (res.statusCode === 200) {
                setCache(key, {
                    body,
                    headers: res.getHeaders()
                }, ttl);
            }
            res.set('X-Cache', 'MISS');
            return originalSend.call(this, body);
        };

        next();
    };
}

export default {
    getCache,
    setCache,
    deleteCache,
    clearAllCache,
    getCacheStats,
    preloadCache,
    cacheMiddleware
};
