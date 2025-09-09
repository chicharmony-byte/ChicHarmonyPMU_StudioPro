// Service Worker para Chic Harmony PMU Studio Pro PWA
const CACHE_NAME = 'pmu-studio-pro-v2.0.0';
const API_CACHE_NAME = 'pmu-studio-api-v2.0.0';

// Archivos críticos para cachear (funcionamiento offline)
const STATIC_CACHE_URLS = [
  '/',
  '/login.html',
  '/subscribe.html',
  '/download.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// URLs de la API que se pueden cachear
const API_CACHE_URLS = [
  '/api/auth/profile',
  '/api/clients',
  '/api/appointments/today'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 PMU Studio Pro SW: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache archivos estáticos
      caches.open(CACHE_NAME).then((cache) => {
        console.log('📦 PMU Studio Pro SW: Caching static files');
        return cache.addAll(STATIC_CACHE_URLS);
      }),
      // Pre-cache algunos datos críticos
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('🔄 PMU Studio Pro SW: Preparing API cache');
        return Promise.resolve(); // Cache se llena cuando se usen las APIs
      })
    ])
  );
  
  // Activar inmediatamente
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ PMU Studio Pro SW: Activated');
  
  event.waitUntil(
    // Limpiar caches antiguos
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('🗑️ PMU Studio Pro SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tomar control de todas las páginas
      return self.clients.claim();
    })
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Estrategia: Cache First para archivos estáticos
  if (STATIC_CACHE_URLS.some(cachedUrl => url.pathname === cachedUrl)) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          console.log('📁 PMU Studio Pro SW: Serving from cache:', url.pathname);
          return response;
        }
        
        console.log('🌐 PMU Studio Pro SW: Fetching from network:', url.pathname);
        return fetch(request).then((response) => {
          // Guardar en cache si la respuesta es válida
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }
  
  // Estrategia: Network First para APIs (con fallback a cache)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).then((response) => {
        // Si la respuesta es exitosa, guardarla en cache
        if (response.status === 200 && request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(API_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Si no hay red, intentar servir desde cache
        console.log('📴 PMU Studio Pro SW: Network failed, trying cache for:', url.pathname);
        return caches.match(request).then((response) => {
          if (response) {
            console.log('📱 PMU Studio Pro SW: Serving API from cache (offline):', url.pathname);
            return response;
          }
          
          // Si no hay cache, retornar respuesta offline
          return new Response(
            JSON.stringify({
              error: 'Offline',
              message: 'Esta funcionalidad requiere conexión a internet',
              offline: true
            }), 
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        });
      })
    );
    return;
  }
  
  // Para todo lo demás, estrategia normal de red
  event.respondWith(fetch(request));
});

// Manejar mensajes desde la app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 PMU Studio Pro SW: Received SKIP_WAITING message');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  console.log('🔔 PMU Studio Pro SW: Push received');
  
  let notificationData = {
    title: 'Chic Harmony PMU Studio Pro',
    body: 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'pmu-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Abrir App'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };
  
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData
      };
    } catch (e) {
      console.log('📋 PMU Studio Pro SW: Push data not JSON, using default');
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('👆 PMU Studio Pro SW: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Manejar actualizaciones en background
self.addEventListener('backgroundsync', (event) => {
  if (event.tag === 'pmu-sync') {
    console.log('🔄 PMU Studio Pro SW: Background sync triggered');
    event.waitUntil(
      // Aquí podrías sincronizar datos pendientes
      Promise.resolve()
    );
  }
});

// Log de inicio
console.log('🌸 Chic Harmony PMU Studio Pro Service Worker v2.0.0 loaded');