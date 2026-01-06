/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

// This service worker prevents caching of POST requests and API routes
// which was causing the error: "Failed to execute 'put' on 'Cache': Request method 'POST' is unsupported"

// Fetch event - intercept all requests
self.addEventListener('fetch', (event) => {
	const { request } = event;
	
	// CRITICAL: Skip non-GET requests (POST, PUT, DELETE, etc.)
	// The Cache API only supports GET requests, so we must not try to cache POST requests
	if (request.method !== 'GET') {
		console.log('[Service Worker] Bypassing non-GET request:', request.method, request.url);
		// Let the request pass through to the network without caching
		return;
	}

	// Skip API routes - they should always go to the network and never be cached
	if (request.url.includes('/api/')) {
		console.log('[Service Worker] Bypassing API route:', request.url);
		// Let the request pass through to the network without caching
		return;
	}

	// Skip external requests (cross-origin)
	if (!request.url.startsWith(self.location.origin)) {
		console.log('[Service Worker] Bypassing external request:', request.url);
		// Let the request pass through to the network without caching
		return;
	}

	// For GET requests to same-origin non-API routes, we can optionally cache them
	// But to be safe and avoid any caching issues, we'll just pass through
	// Uncomment the code below if you want to enable caching for static assets:
	
	/*
	event.respondWith(
		caches.match(request).then((cached) => {
			if (cached) {
				return cached;
			}
			return fetch(request).then((response) => {
				// Only cache successful GET responses
				if (response.status === 200) {
					const responseClone = response.clone();
					caches.open('app-cache').then((cache) => {
						cache.put(request, responseClone);
					});
				}
				return response;
			});
		})
	);
	*/
});

