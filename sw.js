const CACHE = 'jmj-ride-manager-v9';
const ASSETS = ['./','./index.html','./manifest.webmanifest','./sw.js','./assets/jmj-emblem.jpg','./assets/JMJ_TRAVELS_Intro_1080p_Silent.mp4','./assets/JMJ_TRAVELS_Intro_Portrait_1080x1920-1.mp4','./icon-192.svg','./icon-512.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;
  const isAppPage = event.request.mode === 'navigate' || requestUrl.pathname.endsWith('/index.html');
  if (isAppPage) {
    event.respondWith(fetch(event.request, {cache:'no-store'}).then(response => {
      if (response && response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response && response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  })));
});