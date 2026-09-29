const CACHE_NAME = 'planejamento-financeiro-v2-2-pwa-1';
const APP_SHELL = ['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(APP_SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const req=event.request; if(req.method!=='GET') return;
  if(new URL(req.url).origin!==self.location.origin) return;
  event.respondWith(fetch(req).then(r=>{const copy=r.clone(); caches.open(CACHE_NAME).then(c=>c.put(req,copy)); return r;}).catch(()=>caches.match(req).then(c=>c||caches.match('./index.html'))));
});
