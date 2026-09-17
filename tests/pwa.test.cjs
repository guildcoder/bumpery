const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('Home Screen manifest is portable to a GitHub project path with real PNG icons',()=>{
  const manifest=JSON.parse(fs.readFileSync('extension/app.webmanifest','utf8'));const base=new URL('https://owner.github.io/starbound-parlor/');
  assert.equal(new URL(manifest.start_url,base).pathname,'/starbound-parlor/index.html');assert.equal(manifest.display,'standalone');
  for(const icon of [...manifest.icons,{src:'icons/apple-touch-icon.png',sizes:'180x180'}]){const png=fs.readFileSync('extension/'+icon.src),size=Number(icon.sizes.split('x')[0]);assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);assert.equal(png[25],2,'opaque RGB icon');}
});
test('offline worker serves cached app only within its scope and ignores the backend',async()=>{
  const handlers={},requested=[],deleted=[],scope='https://owner.github.io/starbound-parlor/';
  const cache={match:async req=>{requested.push(typeof req==='string'?req:req.url);return 'cached-page';},addAll:async()=>{}};
  const context={URL,fetch:async()=>{throw Error('Offline');},caches:{open:async()=>cache,keys:async()=>['starbound-/starbound-parlor/-old','starbound-/another-game/-old'],delete:async key=>deleted.push(key)},self:{registration:{scope},clients:{claim:async()=>{}},addEventListener:(name,fn)=>handlers[name]=fn}};
  vm.runInNewContext(fs.readFileSync('extension/sw.js','utf8'),context);
  let response;handlers.fetch({request:{url:scope+'index.html',method:'GET',mode:'navigate'},respondWith:p=>response=p});assert.equal(await response,'cached-page');
  response=null;handlers.fetch({request:{url:'https://project.supabase.co/rest/v1/rpc/starbound_leaderboard',method:'POST'},respondWith:p=>response=p});assert.equal(response,null);
  handlers.fetch({request:{url:'https://owner.github.io/another-game/index.html',method:'GET'},respondWith:p=>response=p});assert.equal(response,null);
  let activation;handlers.activate({waitUntil:p=>activation=p});await activation;assert.deepEqual(deleted,['starbound-/starbound-parlor/-old']);
});
