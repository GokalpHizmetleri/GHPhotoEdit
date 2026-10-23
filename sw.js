const CACHE="ghphotoedit-v6-faces";
const ASSETS=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png","./icon-512-maskable.png","./logo.svg","./face-engine.html","./face-engine.js","./vendor/vision_bundle.mjs","./vendor/wasm/vision_wasm_internal.js","./vendor/wasm/vision_wasm_internal.wasm","./vendor/wasm/vision_wasm_nosimd_internal.js","./vendor/wasm/vision_wasm_nosimd_internal.wasm","./vendor/face_landmarker.task"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});
