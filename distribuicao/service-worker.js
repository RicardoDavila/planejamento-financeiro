/* Distribuição: o cache guarda somente arquivos públicos desta pasta. */
const CACHE='pf-distribuicao-v4-12-11';
const BASE=new URL(self.registration.scope);
const FILES=['./','index.html','app.html','conta.js','isolamento.js','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
 if(url.pathname===BASE.pathname+'version.json'){event.respondWith(fetch(request,{cache:'no-store'}));return;}
 const relative=url.pathname.slice(BASE.pathname.length);
 if(!['','index.html','app.html','conta.js','isolamento.js','manifest.webmanifest','icon-192.png','icon-512.png'].includes(relative))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),key=new URL(relative||'index.html',BASE).href;
  try{const response=await fetch(request,{cache:'no-store'});if(response.ok)await cache.put(key,response.clone());return response;}
  catch(error){const saved=await cache.match(key);if(saved)return saved;throw error;}
 })());
});
