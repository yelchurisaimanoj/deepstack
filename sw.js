const CACHE='deepstack-v2';
const ASSETS=['./','index.html','dsa.html','lld.html','sd.html','ai.html','tools.html','concurrency.html','install.html',
 'css/styles.css','js/app.js','js/daily.js','js/dsa.js','js/lld.js','js/sd.js','js/ai.js','js/tools.js','js/conc.js',
 'manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
    const copy=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return res;
  }).catch(()=>caches.match('index.html'))));
});
