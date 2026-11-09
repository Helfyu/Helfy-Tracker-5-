const SHELL='helfy-shell-v3',RUNTIME='helfy-runtime-v1';
const FILES=['./','./index.html','./manifest.json','./icon.png','https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css','https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(SHELL).then(c=>Promise.allSettled(FILES.map(f=>c.add(f)))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==SHELL&&k!==RUNTIME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.hostname.includes('nominatim')||u.hostname.includes('router.project-osrm'))return;
  if(u.origin===location.origin){ // app files: newest first, cache for offline
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(SHELL).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request).then(h=>h||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{
    if(r.ok&&(u.hostname.includes('cartocdn')||u.hostname.includes('jsdelivr'))){const c=r.clone();caches.open(RUNTIME).then(x=>x.put(e.request,c));}
    return r;})));
});
