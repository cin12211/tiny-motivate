/*
 * Motivation service worker (web only; the Capacitor app does not register it).
 * - Built assets (/_nuxt/*, hashed) and reward photos (/uploads/*): cache first.
 * - Page loads: network first, falling back to the cached app shell offline.
 * - API calls are never cached here (the server has its own cache).
 */
const VERSION = 'motivation-v1'
const SHELL = ['/', '/manifest.webmanifest', '/favicon.svg', '/pwa-192.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(VERSION).then(cache => cache.put('/', copy))
          return res
        })
        .catch(() => caches.match('/')),
    )
    return
  }

  if (url.pathname.startsWith('/_nuxt/') || url.pathname.startsWith('/uploads/')) {
    event.respondWith(
      caches.match(request).then(hit => hit || fetch(request).then((res) => {
        if (res.ok) {
          const copy = res.clone()
          caches.open(VERSION).then(cache => cache.put(request, copy))
        }
        return res
      })),
    )
  }
})
