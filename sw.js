/* Macar Dex service worker: network-first (fresh data when online), cache fallback (works offline). */
const C='macar-dex-pages';
const F=['./','index.html','app.js','data.js','moves.js','meta.js','sets.js','es.js','items.js','calcui.js','smogcalc.js','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
function fromNet(req){
  return new Promise((ok,ko)=>{
    const t=setTimeout(()=>ko(new Error('timeout')),4000);
    fetch(req,{cache:'no-cache'}).then(res=>{clearTimeout(t);if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(req,cp))}ok(res)}).catch(err=>{clearTimeout(t);ko(err)});
  });
}
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==location.origin){ // fonts etc.: cache-first
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(req,cp));return res}).catch(()=>r)));return;
  }
  e.respondWith(fromNet(req).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
});
