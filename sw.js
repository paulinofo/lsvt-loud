/* Service Worker LSVT LOUD — cachea la app para uso 100% offline */
var CACHE = "lsvt-loud-v5";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Cache-first: si está en caché lo sirve (offline); si no, red y guarda copia.
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      if(hit) return hit;
      return fetch(e.request).then(function(res){
        return caches.open(CACHE).then(function(c){
          try{ c.put(e.request, res.clone()); }catch(err){}
          return res;
        });
      }).catch(function(){
        return caches.match("./index.html");
      });
    })
  );
});
