const CACHE='tcc-pwa-github-20261119-1',ROOT=new URL('./',self.location.href);
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const response=await fetch(new URL('asset-manifest.json',ROOT),{cache:'no-store'});if(!response.ok)throw Error('Missing offline asset list');const manifest=await response.json();
 const cache=await caches.open(CACHE);
 try{for(const item of manifest.assets){const url=new URL(item.url,ROOT);const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('Missing offline asset '+item.url);
  const bytes=await r.clone().arrayBuffer(),digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
  if(digest!==item.sha256)throw Error('Offline asset integrity mismatch '+item.url);await cache.put(url,r);}
  await cache.put(new URL('asset-manifest.json',ROOT),new Response(JSON.stringify(manifest),{headers:{'Content-Type':'application/json'}}));
 }catch(e){await caches.delete(CACHE);throw e;}
})()));
// No skipWaiting: never replace a running editing/review session.
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
// No global cache cleanup; other apps and active old versions are left untouched.
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),request=url.href===ROOT.href?new Request(new URL('index.html',ROOT)):event.request;
  const cached=await cache.match(request,{ignoreSearch:true});if(cached)return cached;
  return fetch(event.request);
 })());
});
