/* Generated deployments replace the version with a hash of the shipped assets. */
const PREFIX='starbound-'+new URL(self.registration.scope).pathname+'-';
const CACHE=PREFIX+'__BUILD_VERSION__';
const ASSETS=['./','./index.html','./lobby.css','./lobby.js','./tables.js','./starbound.svg','./getaway.html','./getaway.css','./getaway-physics.js','./getaway-renderer.js','./getaway-game.js','./getaway.svg','./elsewhere.html','./elsewhere.css','./elsewhere-physics.js','./elsewhere-renderer.js','./elsewhere-game.js','./elsewhere.svg','./deadwood.html','./deadwood.css','./deadwood-physics.js','./deadwood-renderer.js','./deadwood-game.js','./deadwood.svg','./oldcourse.html','./oldcourse.css','./oldcourse-physics.js','./oldcourse-renderer.js','./oldcourse-game.js','./oldcourse.svg','./game.html','./game.css','./layout.css','./config.js','./leaderboard.js','./physics.js','./renderer.js','./showtime.js','./game.js','./pwa.js','./icon.svg','./app.webmanifest','./icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
  // Waiting workers activate after the old app closes, never halfway through a game.
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url),scope=new URL(self.registration.scope);
  if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
  // Never cache authentication, leaderboard responses, or cross-origin requests.
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(event.request,{ignoreSearch:true});
    if(cached)return cached;
    if(event.request.mode==='navigate')return (await cache.match(new URL('index.html',scope).href))||fetch(event.request);
    return fetch(event.request);
  }));
});
