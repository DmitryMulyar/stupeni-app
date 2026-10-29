// Офлайн-кэш. Страница: сначала сеть (чтобы обновления приходили сразу), без сети — из кэша.
// Картинки, шрифты, иконки: сначала кэш. Работает только по HTTPS (или на localhost).
const CACHE = 'stupeni-v6';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
const put = (req, res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const page = req.mode === 'navigate' || req.url.endsWith('.html') || req.url.endsWith('/');
  if (page) {
    e.respondWith(fetch(req).then(res => put(req, res)).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res =>
    (req.url.startsWith(self.location.origin) || req.url.includes('fonts.g')) ? put(req, res) : res)));
});
