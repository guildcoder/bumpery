const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const tables=require('../extension/tables.js'),{welcomeState}=require('../extension/pwa.js');
test('five tables are shipped; registered table routes and art exist',()=>{
  assert.equal(tables.length,5);assert.equal(tables[0].name,'Starbound Parlor');
  for(const key of ['id','href','storageNamespace','rpcPrefix'])assert.equal(new Set(tables.map(t=>t[key])).size,tables.length);
  for(const table of tables){for(const asset of [table.href,table.art])assert.ok(fs.existsSync('extension/'+asset));assert.match(fs.readFileSync('extension/'+table.href,'utf8'),new RegExp('data-table="'+table.id+'"'));}
  const manifest=JSON.parse(fs.readFileSync('extension/app.webmanifest'));assert.equal(manifest.name,'Bumpery');assert.equal(manifest.start_url,'./index.html');
});
test('first iPhone visit invites installation; installed and returning visits do not nag',()=>{
  assert.deepEqual(welcomeState({ios:true,standalone:false,seen:false}),{show:true,install:true});
  assert.deepEqual(welcomeState({ios:true,standalone:true,seen:false}),{show:true,install:false});
  assert.equal(welcomeState({ios:true,standalone:false,seen:true}).show,false);
  assert.deepEqual(welcomeState({ios:false,standalone:false,seen:false}),{show:true,install:false});
});
test('future table clients cannot reuse Starbound sessions or score RPCs',async()=>{
  const requests=[],storage=new Map([['starbound.session',JSON.stringify({access_token:'old-player',expires_at:9999999999})]]);
  const ctx={module:{exports:{}},AbortController,setTimeout,clearTimeout,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},fetch:async(url,opts)=>{requests.push({url,opts});return{ok:true,json:async()=>url.includes('/signup')?{access_token:'new-player',refresh_token:'new-refresh',expires_in:3600}:'run-id'};}};
  vm.runInNewContext(fs.readFileSync('extension/leaderboard.js','utf8'),ctx);
  const client=new ctx.module.exports.Leaderboard({supabaseUrl:'https://sample.supabase.co',supabasePublishableKey:'sb_publishable_test',rpcPrefix:'future_table',storageNamespace:'future-table'});
  await client.begin();await client.top();await client.submit({id:'run-id',score:25,seconds:3},'Player');
  assert.ok(requests[0].url.endsWith('/signup'));assert.ok(storage.has('future-table.session'));assert.equal(JSON.parse(storage.get('starbound.session')).access_token,'old-player');
  assert.ok(requests[1].url.endsWith('/rpc/future_table_start_run'));assert.ok(requests[2].url.endsWith('/rpc/future_table_leaderboard'));assert.ok(requests[3].url.endsWith('/rpc/future_table_submit_score'));
  assert.equal(requests[3].opts.headers.Authorization,'Bearer new-player');
});
test('offline install includes lobby, table, branding, and registry assets',async()=>{
  let install,assets;const ctx={URL,self:{registration:{scope:'https://owner.github.io/bumpery/'},addEventListener:(type,fn)=>{if(type==='install')install=fn;}},caches:{open:async()=>({addAll:async a=>assets=a})}};
  vm.runInNewContext(fs.readFileSync('extension/sw.js','utf8'),ctx);let work;install({waitUntil:p=>work=p});await work;
  for(const asset of ['./index.html','./game.html','./lobby.js','./lobby.css','./tables.js','./starbound.svg','./pwa.js','./icon.svg'])assert.ok(assets.includes(asset),asset);
  for(const asset of assets.filter(x=>x!=='./'))assert.ok(fs.existsSync('extension/'+asset.slice(2)),asset);
});
