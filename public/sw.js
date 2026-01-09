// Service Worker for PWA Caching
const CACHE_NAME = 'floral-essence-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/index.css',
    '/assets/index.css',
    '/assets/index.js'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Cache install failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    // Cache images and static assets
                    if (event.request.url.match(/\.(jpg|jpeg|png|webp|gif|css|js)$/i)) {
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                    }

                    return response;
                });
            })
            .catch(() => {
                // Offline fallback - you can return a custom offline page here
                console.log('Offline - failed to fetch:', event.request.url);
            })
    );
});
