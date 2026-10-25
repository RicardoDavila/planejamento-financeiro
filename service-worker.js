
/* Planejamento Financeiro - PWA V4.11.8 */
const CACHE_NAME = 'planejamento-financeiro-v4-11-8';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))

  );
});

self.addEventListener('message', event => { if(event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('planejamento-financeiro-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  const scopeUrl = new URL(self.registration.scope);
  if(url.origin === scopeUrl.origin && !url.pathname.startsWith(scopeUrl.pathname)) return;
  if(url.origin === scopeUrl.origin && url.pathname === scopeUrl.pathname + 'version.json'){event.respondWith(fetch(request,{cache:'no-store'}));return;}
  // Não interceptar indicadores econômicos nem conteúdo protegido.
  if(url.hostname === 'api.bcb.gov.br') return;
  // Não interceptar chamadas do Supabase.
  if (url.hostname.endsWith('.supabase.co')) return;

  // Para páginas, priorizar a versão publicada na rede.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put('./index.html', copy));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Arquivos locais: usar cache e atualizar quando possível.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request, { cache: 'no-store' })
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);

        return cached || network;
      })
    );
    return;
  }

  // Bibliotecas externas: rede primeiro, cache como alternativa.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && (response.ok || response.type === 'opaque')) {
          const copy = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
