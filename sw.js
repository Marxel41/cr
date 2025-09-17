const CACHE_NAME = 'clash-guesser-v1';
const urlsToCache = [
    './index.html',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Inter:wght@400;500;700&display=swap',
    'https://placehold.co/1920x1080/1a202c/3c3c3c.png&text=+',
    'https://placehold.co/200x240/2d3748/e2e8f0?text=?'
];

// Install a service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
    // Nur Anfragen für http oder https abfangen.
    if (event.request.url.startsWith('http')) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }

                    return fetch(event.request).then(
                        response => {
                            // Check if we received a valid response
                            if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
                                return response;
                            }

                            // IMPORTANT: Clone the response. A response is a stream
                            // and because we want the browser to consume the response
                            // as well as the cache consuming the response, we need
                            // to clone it so we have two streams.
                            const responseToCache = response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });

                            return response;
                        }
                    );
                })
        );
    }
});


// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
